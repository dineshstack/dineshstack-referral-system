<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'category'   => $this->category,
            'icon'       => $this->icon,
            'color'      => $this->color,
            'commission' => $this->commission,
            'promo_code' => $this->promo_code,
            'link_type'  => $this->link_type,
            'prefix'     => $this->prefix,
            'embed_url'  => $this->embed_url,
            'referral_benefit'  => $this->referral_benefit,
            'exclusive_note'    => $this->exclusive_note,
            'last_verified_at'  => $this->last_verified_at?->toIso8601String(),
            'total_clicks'      => $this->total_clicks,
            'clicks_30d'        => $this->clicks_30d ?? 0,
            'created_at'       => $this->created_at?->toIso8601String(),
        ];
    }
}
