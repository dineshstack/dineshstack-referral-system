<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int         $id
 * @property int         $program_id
 * @property string      $amount
 * @property string      $currency
 * @property string      $paid_at
 * @property string|null $payment_method
 * @property string|null $notes
 */
class Payout extends Model
{
    protected $fillable = [
        'program_id',
        'amount',
        'currency',
        'paid_at',
        'payment_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount'  => 'decimal:2',
            'paid_at' => 'date',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
