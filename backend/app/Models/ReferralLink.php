<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralLink extends Model
{
    protected $fillable = [
        'program_id',
        'url',
        'status',
        'position',
        'activated_at',
        'used_at',
        'expires_at',
        'notes',
        'health_status',
        'health_checked_at',
    ];

    protected function casts(): array
    {
        return [
            'activated_at'     => 'datetime',
            'used_at'          => 'datetime',
            'expires_at'       => 'datetime',
            'health_checked_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
