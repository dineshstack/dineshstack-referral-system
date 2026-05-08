<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostbackEvent extends Model
{
    protected $fillable = [
        'program_id',
        'click_event_id',
        'event_type',
        'amount',
        'currency',
        'transaction_id',
        'raw_payload',
    ];

    protected function casts(): array
    {
        return [
            'amount'      => 'decimal:2',
            'raw_payload' => 'array',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function clickEvent(): BelongsTo
    {
        return $this->belongsTo(ClickEvent::class);
    }
}