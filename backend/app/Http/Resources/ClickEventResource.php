<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClickEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'ip_address'       => $this->ip_address,
            'referer'          => $this->referer,
            'utm_source'       => $this->utm_source,
            'utm_medium'       => $this->utm_medium,
            'utm_campaign'     => $this->utm_campaign,
            'country'          => $this->country,
            'link_was_rotated' => $this->link_was_rotated,
            'is_bot'           => $this->is_bot,
            'created_at'       => $this->created_at?->toIso8601String(),
        ];
    }
}
