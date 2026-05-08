<?php
// app/Services/LinkRotationService.php

namespace App\Services;

use App\Models\Program;
use App\Models\ReferralLink;
use App\Models\ClickEvent;
use App\Notifications\QueueLowNotification;
use App\Notifications\QueueEmptyNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class LinkRotationService
{
    /**
     * Main entry point called on every redirect hit.
     * Returns the URL to redirect the visitor to, or null if no link available.
     */
    public function handleClick(Program $program, array $requestData = []): ?string
    {
        $isBot = (bool) ($requestData['is_bot'] ?? false);

        return DB::transaction(function () use ($program, $requestData, $isBot) {

            // Always count the click (bots included for raw traffic stats)
            $program->increment('total_clicks');

            // Get the currently active link with a row-level lock
            $activeLink = $this->getActiveLink($program);

            // ── PERMANENT LINK ─────────────────────────────────────────────────
            if ($program->link_type === 'permanent') {
                $this->logClick($program, $activeLink, $requestData, false);
                return $activeLink?->url;
            }

            // ── ONE-TIME LINK — bots do NOT consume links ──────────────────────
            if ($isBot) {
                $this->logClick($program, $activeLink, $requestData, false);
                // Return the current active URL but do NOT rotate it
                return $activeLink?->url;
            }

            if (!$activeLink) {
                $activeLink = $this->promoteNextFromQueue($program);
                if (!$activeLink) {
                    Log::warning("Program [{$program->slug}] has no active or queued links.");
                    $this->logClick($program, null, $requestData, false);
                    return null;
                }
            }

            $redirectUrl = $activeLink->url;

            // Mark this link as USED
            $activeLink->update([
                'status'  => 'used',
                'used_at' => now(),
            ]);
            $program->increment('total_conversions');

            // Rotate: promote the next queued link to active
            $nextLink   = $this->promoteNextFromQueue($program);
            $wasRotated = (bool) $nextLink;

            $this->logClick($program, $activeLink, $requestData, $wasRotated);
            $this->sendNotificationsIfNeeded($program, $wasRotated);

            return $redirectUrl;
        });
    }

    /**
     * Get the active link, skipping any that have expired.
     * If the active link is expired, marks it expired and promotes the next one.
     */
    private function getActiveLink(Program $program): ?ReferralLink
    {
        $link = $program->links()
            ->where('status', 'active')
            ->lockForUpdate()
            ->first();

        if (!$link) {
            return null;
        }

        // If the link has an expiry date and it's in the past, retire it
        if ($link->isExpired()) {
            $link->update(['status' => 'expired']);
            return $this->promoteNextFromQueue($program);
        }

        return $link;
    }

    /**
     * Promote the next queued (non-expired) link to active status.
     */
    public function promoteNextFromQueue(Program $program): ?ReferralLink
    {
        // Skip over expired queued links in one query
        $next = $program->links()
            ->where('status', 'queued')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderBy('position')
            ->lockForUpdate()
            ->first();

        if (!$next) {
            return null;
        }

        $next->update([
            'status'       => 'active',
            'activated_at' => now(),
        ]);

        return $next;
    }

    /**
     * Add multiple links to a program's queue in one go.
     * Returns number of links successfully added.
     */
    public function addLinksToQueue(Program $program, array $urls): int
    {
        $urls = array_filter(array_map('trim', $urls));

        if (empty($urls)) {
            return 0;
        }

        // Deduplicate against existing active/queued links
        $existing = $program->links()
            ->whereIn('status', ['active', 'queued'])
            ->pluck('url')
            ->toArray();

        $newUrls = array_values(array_diff($urls, $existing));

        if (empty($newUrls)) {
            return 0;
        }

        $maxPosition = $program->links()->max('position') ?? -1;

        $records = [];
        foreach ($newUrls as $i => $url) {
            $records[] = [
                'program_id' => $program->id,
                'url'        => $url,
                'status'     => 'queued',
                'position'   => $maxPosition + 1 + $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('referral_links')->insert($records);

        if (!$program->activeLink()) {
            $this->promoteNextFromQueue($program);
        }

        return count($records);
    }

    /**
     * Send notifications based on queue depth, with escalating severity.
     *
     * Levels (configurable per program):
     *   - low:      queue < low_queue_threshold      → email + Telegram warning
     *   - critical: queue ≤ critical_queue_threshold  → email + Telegram + Discord alert
     *   - empty:    queue = 0 and no active link      → all channels, loudest message
     */
    private function sendNotificationsIfNeeded(Program $program, bool $wasRotated): void
    {
        $queueCount = $program->queueCount();
        $isEmpty    = $queueCount === 0 && !$program->activeLink();
        $isCritical = !$isEmpty && $queueCount <= $program->critical_queue_threshold;
        $isLow      = !$isEmpty && !$isCritical && $program->isQueueLow();

        if ($isEmpty) {
            Notification::route('mail', config('referral.notify_email'))
                ->notify(new QueueEmptyNotification($program));

            $this->sendTelegram(
                "🚨 *{$program->name}* queue is EMPTY!\n" .
                "No more referral links available.\n" .
                "👉 [Add links now](" . config('app.url') . "/programs/{$program->id}/links)\n" .
                "🔗 [Affiliate Dashboard]({$program->affiliate_dashboard_url})"
            );

            $this->sendDiscord(
                "🚨 **{$program->name}** queue is **EMPTY** — visitors are getting no link!\n" .
                config('app.url') . "/programs/{$program->id}/links"
            );

        } elseif ($isCritical) {
            Notification::route('mail', config('referral.notify_email'))
                ->notify(new QueueLowNotification($program, $queueCount));

            $this->sendTelegram(
                "🔴 *{$program->name}* CRITICAL — only *{$queueCount}* link(s) left!\n" .
                "👉 [Add links now](" . config('app.url') . "/programs/{$program->id}/links)"
            );

            $this->sendDiscord(
                "🔴 **{$program->name}** queue is CRITICAL — only **{$queueCount}** link(s) left!\n" .
                config('app.url') . "/programs/{$program->id}/links"
            );

        } elseif ($isLow) {
            Notification::route('mail', config('referral.notify_email'))
                ->notify(new QueueLowNotification($program, $queueCount));

            $this->sendTelegram(
                "⚠️ *{$program->name}* queue is LOW — only *{$queueCount}* link(s) left.\n" .
                "👉 [Add links now](" . config('app.url') . "/programs/{$program->id}/links)"
            );
        }

        if ($wasRotated) {
            Log::info("Program [{$program->slug}] link used → rotated to next queued link.");
        }
    }

    // ── Notification channels ─────────────────────────────────────────────────

    private function sendTelegram(string $message): void
    {
        $token  = config('referral.telegram_bot_token');
        $chatId = config('referral.telegram_chat_id');

        if (!$token || !$chatId) {
            return;
        }

        try {
            $url = "https://api.telegram.org/bot{$token}/sendMessage";
            $ch  = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POSTFIELDS     => http_build_query([
                    'chat_id'    => $chatId,
                    'text'       => $message,
                    'parse_mode' => 'Markdown',
                ]),
            ]);
            curl_exec($ch);
            curl_close($ch);
        } catch (\Throwable $e) {
            Log::error('Telegram notification failed: ' . $e->getMessage());
        }
    }

    private function sendDiscord(string $message): void
    {
        $webhookUrl = config('referral.discord_webhook_url');

        if (!$webhookUrl) {
            return;
        }

        try {
            Http::post($webhookUrl, ['content' => $message]);
        } catch (\Throwable $e) {
            Log::error('Discord notification failed: ' . $e->getMessage());
        }
    }

    // ── Click logging ─────────────────────────────────────────────────────────

    private function logClick(Program $program, ?ReferralLink $link, array $data, bool $rotated): void
    {
        ClickEvent::create([
            'program_id'       => $program->id,
            'referral_link_id' => $link?->id,
            'ip_address'       => $data['ip'] ?? null,
            'user_agent'       => $data['user_agent'] ?? null,
            'referer'          => $data['referer'] ?? null,
            'utm_source'       => $data['utm_source'] ?? null,
            'utm_medium'       => $data['utm_medium'] ?? null,
            'utm_campaign'     => $data['utm_campaign'] ?? null,
            'country'          => $data['country'] ?? null,
            'link_was_rotated' => $rotated,
            'is_bot'           => $data['is_bot'] ?? false,
        ]);
    }
}
