<?php
// app/Console/Commands/SendDailyDigest.php
// Run:       php artisan referral:daily-digest
// Scheduled: every day at 08:00 via bootstrap/app.php
//
// Sends a morning summary of yesterday's performance via Telegram and email.

namespace App\Console\Commands;

use App\Models\ClickEvent;
use App\Models\Program;
use App\Models\ReferralLink;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendDailyDigest extends Command
{
    protected $signature   = 'referral:daily-digest {--date= : Override date (Y-m-d, defaults to yesterday)}';
    protected $description = 'Send a morning summary of the previous day\'s performance';

    public function handle(): int
    {
        $date      = $this->option('date') ?? now()->subDay()->toDateString();
        $startOf   = now()->parse($date)->startOfDay();
        $endOf     = now()->parse($date)->endOfDay();

        // ── Gather stats ───────────────────────────────────────────────────────

        $allClicks  = ClickEvent::whereBetween('created_at', [$startOf, $endOf])->count();
        $botClicks  = ClickEvent::whereBetween('created_at', [$startOf, $endOf])->where('is_bot', true)->count();
        $realClicks = $allClicks - $botClicks;
        $rotations  = ClickEvent::whereBetween('created_at', [$startOf, $endOf])
            ->where('link_was_rotated', true)->count();

        // Per-program breakdown
        $programs = Program::withCount([
            'links as queued_count' => fn ($q) => $q->where('status', 'queued'),
        ])->get();

        // Queue warnings (empty or low)
        $warnings = $programs->filter(fn ($p) => $p->is_empty || $p->is_queue_low);

        // Dead links
        $deadLinks = ReferralLink::whereIn('status', ['active', 'queued'])
            ->where('health_status', 'dead')
            ->count();

        // ── Build messages ────────────────────────────────────────────────────

        $telegramMsg = $this->buildTelegramMessage($date, $realClicks, $botClicks, $rotations, $programs, $warnings, $deadLinks);
        $htmlBody    = $this->buildEmailHtml($date, $realClicks, $botClicks, $rotations, $programs, $warnings, $deadLinks);

        $this->sendTelegram($telegramMsg);
        $this->sendEmail($date, $htmlBody);

        $this->info("Daily digest sent for {$date} — {$realClicks} real clicks, {$rotations} rotations.");
        return Command::SUCCESS;
    }

    private function buildTelegramMessage(
        string $date, int $realClicks, int $botClicks, int $rotations,
        $programs, $warnings, int $deadLinks
    ): string {
        $lines   = ["📊 *Daily Digest — {$date}*\n"];
        $lines[] = "👆 Real clicks: *{$realClicks}*";
        $lines[] = "🤖 Bot clicks: *{$botClicks}*";
        $lines[] = "🔁 Link rotations: *{$rotations}*";

        if ($deadLinks > 0) {
            $lines[] = "⚠️ Dead links: *{$deadLinks}* — run health check!";
        }

        $lines[] = "\n*Per-program:*";
        foreach ($programs as $p) {
            $clicks = ClickEvent::where('program_id', $p->id)
                ->whereBetween('created_at', [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()])
                ->where('is_bot', false)
                ->count();

            $queueNote = $p->is_empty ? ' 🚨 EMPTY' : ($p->is_queue_low ? " ⚠️ {$p->queued_count} left" : " ({$p->queued_count} queued)");
            $lines[]   = "  {$p->icon} {$p->name}: *{$clicks}* clicks{$queueNote}";
        }

        if ($warnings->isNotEmpty()) {
            $lines[] = "\n⚠️ *Low/empty queues:* " . $warnings->pluck('name')->implode(', ');
        }

        $lines[] = "\n🔗 " . config('app.url');
        return implode("\n", $lines);
    }

    private function buildEmailHtml(
        string $date, int $realClicks, int $botClicks, int $rotations,
        $programs, $warnings, int $deadLinks
    ): string {
        $rows = '';
        foreach ($programs as $p) {
            $clicks = ClickEvent::where('program_id', $p->id)
                ->whereBetween('created_at', [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()])
                ->where('is_bot', false)
                ->count();

            $queueStatus = $p->is_empty ? '<span style="color:#dc2626">EMPTY</span>'
                : ($p->is_queue_low ? "<span style=\"color:#d97706\">{$p->queued_count} left</span>"
                : "{$p->queued_count} queued");

            $rows .= "<tr>
                <td style=\"padding:6px 12px\">{$p->icon} {$p->name}</td>
                <td style=\"padding:6px 12px;text-align:center\">{$clicks}</td>
                <td style=\"padding:6px 12px;text-align:center\">{$queueStatus}</td>
              </tr>";
        }

        $deadWarning = $deadLinks > 0
            ? "<p style=\"color:#dc2626;font-weight:bold\">⚠️ {$deadLinks} dead link(s) detected — run the health check.</p>"
            : '';

        $queueWarning = $warnings->isNotEmpty()
            ? "<p style=\"color:#d97706\">⚠️ Low/empty queues: " . $warnings->pluck('name')->implode(', ') . '</p>'
            : '';

        return "
        <h2 style=\"font-family:sans-serif\">Daily Digest — {$date}</h2>
        <table style=\"font-family:sans-serif;font-size:14px\">
          <tr><td style=\"padding:4px 12px\">Real clicks</td><td><strong>{$realClicks}</strong></td></tr>
          <tr><td style=\"padding:4px 12px\">Bot clicks</td><td>{$botClicks}</td></tr>
          <tr><td style=\"padding:4px 12px\">Link rotations</td><td><strong>{$rotations}</strong></td></tr>
        </table>
        {$deadWarning}
        <h3 style=\"font-family:sans-serif;margin-top:20px\">Per-program</h3>
        <table border=\"1\" cellspacing=\"0\" style=\"font-family:sans-serif;font-size:13px;border-collapse:collapse\">
          <thead style=\"background:#f3f4f6\">
            <tr>
              <th style=\"padding:6px 12px;text-align:left\">Program</th>
              <th style=\"padding:6px 12px\">Clicks</th>
              <th style=\"padding:6px 12px\">Queue</th>
            </tr>
          </thead>
          <tbody>{$rows}</tbody>
        </table>
        {$queueWarning}
        <p style=\"font-family:sans-serif;font-size:12px;color:#6b7280;margin-top:24px\">
          — DineshStack Referral Manager
        </p>";
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
            Log::error('SendDailyDigest Telegram failed: ' . $e->getMessage());
        }
    }

    private function sendEmail(string $date, string $htmlBody): void
    {
        $to = config('referral.notify_email');
        if (!$to) {
            return;
        }

        try {
            Mail::html($htmlBody, function ($m) use ($to, $date) {
                $m->to($to)->subject("📊 Daily Digest — {$date}");
            });
        } catch (\Throwable $e) {
            Log::error('SendDailyDigest email failed: ' . $e->getMessage());
        }
    }
}