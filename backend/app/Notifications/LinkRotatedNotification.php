<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LinkRotatedNotification extends Notification
{
    use Queueable;

    public function __construct(public Program $program) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject("[{$this->program->name}] Referral link rotated")
            ->line("A visitor just used a referral link for **{$this->program->name}**.")
            ->line("The next queued link has been promoted to active.")
            ->line("Queue remaining: {$this->program->queueCount()} link(s).")
            ->salutation('— DineshStack Referral Manager');
    }
}
