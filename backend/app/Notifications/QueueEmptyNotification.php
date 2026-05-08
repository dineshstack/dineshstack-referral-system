<?php
// app/Notifications/QueueEmptyNotification.php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QueueEmptyNotification extends Notification
{
    use Queueable;

    public function __construct(public Program $program) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $addLinksUrl  = config('app.url') . '/programs/' . $this->program->id . '/links';
        $dashboardUrl = $this->program->affiliate_dashboard_url;

        return (new MailMessage)
            ->subject("🚨 [{$this->program->name}] Queue EMPTY — visitors getting no link!")
            ->greeting("🚨 Action Required!")
            ->line("Your **{$this->program->name}** referral link queue is completely empty.")
            ->line("Visitors clicking your blog/YouTube links are currently getting **no referral link**. You're losing commissions every minute!")
            ->action('🚨 Add Links Immediately', $addLinksUrl)
            ->when($dashboardUrl, fn($m) => $m->line("[Open {$this->program->name} Affiliate Dashboard]({$dashboardUrl})"))
            ->salutation('— DineshStack Referral Manager');
    }
}
