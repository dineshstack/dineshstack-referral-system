<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'program_id'   => $this->program_id,
            'url'          => $this->url,
            'status'       => $this->status,
            'position'     => $this->position,
            'activated_at' => $this->activated_at?->toIso8601String(),
            'used_at'      => $this->used_at?->toIso8601String(),
            'expires_at'        => $this->expires_at?->toIso8601String(),
            'notes'             => $this->notes,
            'health_status'     => $this->health_status,
            'health_checked_at' => $this->health_checked_at?->toIso8601String(),
            'created_at'        => $this->created_at?->toIso8601String(),
        ];
    }
}
