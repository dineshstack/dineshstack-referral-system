<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClickEvent extends Model
{
    protected $fillable = [
        'program_id',
        'referral_link_id',
        'ip_address',
        'user_agent',
        'referer',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'country',
        'link_was_rotated',
        'is_bot',
    ];

    protected function casts(): array
    {
        return [
            'link_was_rotated' => 'boolean',
            'is_bot'           => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function referralLink(): BelongsTo
    {
        return $this->belongsTo(ReferralLink::class);
    }
}
