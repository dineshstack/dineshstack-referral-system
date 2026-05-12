<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkHealthCheck extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'link_id',
        'checked_at',
        'is_healthy',
        'status_code',
        'response_time_ms',
    ];

    protected function casts(): array
    {
        return [
            'checked_at' => 'datetime',
            'is_healthy' => 'boolean',
        ];
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(ReferralLink::class, 'link_id');
    }
}
