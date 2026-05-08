<?php
// database/seeders/ProgramSeeder.php

namespace Database\Seeders;

use App\Models\Program;
use App\Services\LinkRotationService;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(LinkRotationService $rotator): void
    {
        // Example: Hostinger (one-time links)
        $hostinger = Program::create([
            'name'                    => 'Hostinger',
            'slug'                    => 'hostinger',
            'category'                => 'Hosting',
            'icon'                    => '🟠',
            'color'                   => '#f97316',
            'commission'              => '20%',
            'link_type'               => 'onetime',
            'affiliate_dashboard_url' => 'https://www.hostinger.com/affiliates',
            'low_queue_threshold'     => 3,
        ]);

        // Add your real Hostinger affiliate links here
        $rotator->addLinksToQueue($hostinger, [
            'https://hostinger.com?ref=YOURCODE_001',
            'https://hostinger.com?ref=YOURCODE_002',
            'https://hostinger.com?ref=YOURCODE_003',
            'https://hostinger.com?ref=YOURCODE_004',
            'https://hostinger.com?ref=YOURCODE_005',
        ]);

        // Example: NordVPN (permanent link — never expires)
        $nordvpn = Program::create([
            'name'                    => 'NordVPN',
            'slug'                    => 'nordvpn',
            'category'                => 'VPN',
            'icon'                    => '🔵',
            'color'                   => '#3b82f6',
            'commission'              => '40%',
            'link_type'               => 'permanent',
            'affiliate_dashboard_url' => 'https://affiliates.nordvpn.com',
            'low_queue_threshold'     => 1,
        ]);

        $rotator->addLinksToQueue($nordvpn, [
            'https://nordvpn.com?ref=YOURPERMANENTCODE',
        ]);

        $this->command->info('Programs seeded! Update the links with your real affiliate codes.');
    }
}
