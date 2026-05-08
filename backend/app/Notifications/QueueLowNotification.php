<?php
// app/Notifications/QueueLowNotification.php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QueueLowNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Program $program,
        public int $remaining
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $addLinksUrl  = config('app.url') . '/programs/' . $this->program->id . '/links';
        $dashboardUrl = $this->program->affiliate_dashboard_url;

        return (new MailMessage)
            ->subject("⚠️ [{$this->program->name}] Referral queue is low — {$this->remaining} link(s) left")
            ->greeting("Hey Dinesh 👋")
            ->line("Your **{$this->program->name}** referral link queue is running low.")
            ->line("Only **{$this->remaining}** link(s) remaining before you go offline.")
            ->action('➕ Add More Links Now', $addLinksUrl)
            ->when($dashboardUrl, fn($m) => $m->line("[Open {$this->program->name} Affiliate Dashboard]({$dashboardUrl})"))
            ->line('Generate 5–10 new links from your affiliate panel and paste them in — takes 2 minutes!')
            ->salutation('— DineshStack Referral Manager');
    }
}
