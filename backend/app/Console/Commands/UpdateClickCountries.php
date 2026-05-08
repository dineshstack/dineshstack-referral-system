<?php
// app/Console/Commands/UpdateClickCountries.php
// Run:       php artisan referral:update-countries
// Scheduled: every 5 minutes via bootstrap/app.php
//
// Uses the free ip-api.com batch endpoint (no API key, up to 100 IPs per request).
// Resolves IPs that are still NULL in click_events.country.

namespace App\Console\Commands;

use App\Models\ClickEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateClickCountries extends Command
{
    protected $signature   = 'referral:update-countries {--limit=500}';
    protected $description = 'Batch-resolve IP addresses to ISO country codes for click events';

    // IPs we never want to send to an external API
    private const SKIP_IPS = ['127.0.0.1', '::1', '0.0.0.0', 'localhost'];

    public function handle(): int
    {
        $limit = (int) $this->option('limit');

        // Get unique unresolved IPs (skip loopback / private well-knowns)
        $ips = ClickEvent::whereNotNull('ip_address')
            ->whereNull('country')
            ->whereNotIn('ip_address', self::SKIP_IPS)
            ->limit($limit)
            ->pluck('ip_address')
            ->unique()
            ->values();

        if ($ips->isEmpty()) {
            $this->info('All click IPs already resolved.');
            return Command::SUCCESS;
        }

        $this->line("Resolving {$ips->count()} unique IP(s) …");

        $resolved = 0;

        // ip-api.com free tier: max 100 IPs per batch request, ~45 requests/min
        foreach ($ips->chunk(100) as $chunk) {
            $payload = $chunk->map(fn ($ip) => ['query' => $ip])->values()->toArray();

            try {
                $response = Http::timeout(5)
                    ->post('http://ip-api.com/batch?fields=query,status,countryCode', $payload);
            } catch (\Throwable $e) {
                $this->warn("ip-api.com request failed: {$e->getMessage()}");
                Log::warning('UpdateClickCountries: HTTP error — ' . $e->getMessage());
                break;
            }

            if (!$response->ok()) {
                $this->warn("ip-api.com returned HTTP {$response->status()}, stopping.");
                break;
            }

            foreach ($response->json() as $result) {
                if (($result['status'] ?? '') !== 'success' || empty($result['countryCode'])) {
                    continue;
                }

                // Update all click events with this IP in one query
                ClickEvent::where('ip_address', $result['query'])
                    ->whereNull('country')
                    ->update(['country' => $result['countryCode']]);

                $resolved++;
            }

            // Respect the free-tier rate limit: wait 1.5 s between batches
            if ($ips->chunk(100)->count() > 1) {
                usleep(1_500_000);
            }
        }

        $this->info("Done — resolved {$resolved} unique IP(s).");
        return Command::SUCCESS;
    }
}