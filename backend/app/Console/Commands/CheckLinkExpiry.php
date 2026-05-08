<?php
// app/Console/Commands/CheckLinkExpiry.php
// Run: php artisan referral:check-expiry
// Scheduled: every hour via bootstrap/app.php

namespace App\Console\Commands;

use App\Models\Program;
use App\Models\ReferralLink;
use App\Services\LinkRotationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLinkExpiry extends Command
{
    protected $signature   = 'referral:check-expiry';
    protected $description = 'Expire overdue links and promote next queued links to active';

    public function __construct(private LinkRotationService $rotator)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        // 1. Expire all queued links whose expires_at has passed
        $expiredQueued = ReferralLink::where('status', 'queued')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expiredQueued as $link) {
            $link->update(['status' => 'expired']);
            $this->line("  Expired queued link #{$link->id} for program #{$link->program_id}");
        }

        // 2. Expire all active links whose expires_at has passed, then promote next
        $expiredActive = ReferralLink::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expiredActive as $link) {
            $link->update(['status' => 'expired']);
            $program = $link->program;
            $next    = $this->rotator->promoteNextFromQueue($program);

            $this->line(
                "  Expired active link #{$link->id} for [{$program->slug}]" .
                ($next ? " → promoted #{$next->id}" : ' → queue empty!')
            );

            Log::info("CheckLinkExpiry: expired active link #{$link->id} [{$program->slug}]" .
                ($next ? ", promoted #{$next->id}" : ', queue now empty'));
        }

        $total = $expiredQueued->count() + $expiredActive->count();
        $this->info("Done — {$total} link(s) expired.");

        return Command::SUCCESS;
    }
}