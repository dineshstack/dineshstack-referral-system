<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'program_id'     => $this->program_id,
            'amount'         => (float) $this->amount,
            'currency'       => $this->currency,
            'paid_at'        => $this->paid_at->toDateString(),
            'payment_method' => $this->payment_method,
            'notes'          => $this->notes,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
