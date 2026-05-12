<?php
// app/Console/Commands/CheckLinkHealth.php
// Run:       php artisan referral:check-health
// Scheduled: daily at 3:00 AM via bootstrap/app.php
//
// HTTP HEAD-checks every active/queued link that hasn't been checked in 24 hours.
// Marks dead links and sends a Telegram/Discord alert.

namespace App\Console\Commands;

use App\Models\LinkHealthCheck;
use App\Models\ReferralLink;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckLinkHealth extends Command
{
    protected $signature   = 'referral:check-health {--force : Re-check all links regardless of last check time}';
    protected $description = 'HTTP HEAD-check active and queued links, flag dead ones';

    public function handle(): int
    {
        $query = ReferralLink::with('program')
            ->whereIn('status', ['active', 'queued']);

        if (!$this->option('force')) {
            // Only re-check links not checked in the last 24 hours
            $query->where(function ($q) {
                $q->whereNull('health_checked_at')
                  ->orWhere('health_checked_at', '<', now()->subHours(24));
            });
        }

        $links = $query->get();

        if ($links->isEmpty()) {
            $this->info('All links checked recently — nothing to do.');
            return Command::SUCCESS;
        }

        $this->line("Checking {$links->count()} link(s) …");

        $deadLinks  = [];
        $okCount    = 0;
        $deadCount  = 0;

        foreach ($links as $link) {
            $result  = $this->checkLink($link->url);
            $healthy = $result['healthy'];

            $link->update([
                'health_status'     => $healthy ? 'ok' : 'dead',
                'health_checked_at' => now(),
            ]);

            LinkHealthCheck::create([
                'link_id'          => $link->id,
                'checked_at'       => now(),
                'is_healthy'       => $healthy,
                'status_code'      => $result['status_code'],
                'response_time_ms' => $result['response_time_ms'],
            ]);

            if ($healthy) {
                $okCount++;
                $this->line("  ✓ [{$result['status_code']}] {$link->url} ({$result['response_time_ms']}ms)");
            } else {
                $deadCount++;
                $deadLinks[] = $link;
                $this->warn("  ✗ DEAD [{$result['status_code']}] [{$link->program->slug}] {$link->url}");
                Log::warning("CheckLinkHealth: dead link #{$link->id} [{$link->program->slug}] {$link->url}");
            }
        }

        $this->info("Done — {$okCount} ok, {$deadCount} dead.");

        if (!empty($deadLinks)) {
            $this->sendDeadLinkAlert($deadLinks);
        }

        return Command::SUCCESS;
    }

    /** @return array{healthy: bool, status_code: int|null, response_time_ms: int|null} */
    private function checkLink(string $url): array
    {
        $start = microtime(true);
        try {
            // Use GET with a 0-byte range instead of HEAD — some servers reject HEAD.
            // withoutVerifying() avoids SSL errors on misconfigured affiliate URLs.
            $response = Http::timeout(8)
                ->withoutVerifying()
                ->withHeaders(['Range' => 'bytes=0-0'])
                ->get($url);

            $ms = (int) round((microtime(true) - $start) * 1000);

            // 2xx or 3xx = alive. 4xx (404, 410) = dead. 5xx = server error (treat as dead).
            return [
                'healthy'          => $response->status() < 400,
                'status_code'      => $response->status(),
                'response_time_ms' => $ms,
            ];
        } catch (\Throwable) {
            return ['healthy' => false, 'status_code' => null, 'response_time_ms' => null];
        }
    }

    private function sendDeadLinkAlert(array $deadLinks): void
    {
        $lines = collect($deadLinks)
            ->map(fn ($l) => "• [{$l->program->slug}] {$l->url}")
            ->implode("\n");

        $message = "🔴 *Dead affiliate links detected*\n\n{$lines}\n\n"
            . "These links returned errors. Remove or replace them to avoid sending visitors to broken pages.";

        $this->sendTelegram($message);
        $this->sendDiscord(str_replace('*', '**', $message));
    }

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
            Log::error('CheckLinkHealth Telegram alert failed: ' . $e->getMessage());
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
            Log::error('CheckLinkHealth Discord alert failed: ' . $e->getMessage());
        }
    }
}