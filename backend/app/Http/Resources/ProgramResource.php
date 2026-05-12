<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'parent_id'               => $this->parent_id,
            'name'                    => $this->name,
            'slug'                    => $this->slug,
            'category'                => $this->category,
            'icon'                    => $this->icon,
            'color'                   => $this->color,
            'commission'              => $this->commission,
            'promo_code'              => $this->promo_code,
            'link_type'               => $this->link_type,
            'affiliate_dashboard_url' => $this->affiliate_dashboard_url,
            'referral_benefit'        => $this->referral_benefit,
            'exclusive_note'          => $this->exclusive_note,
            'last_verified_at'        => $this->last_verified_at?->toIso8601String(),
            'login_email'             => $this->login_email,
            'login_password'          => $this->login_password,
            'login_method'            => $this->login_method,
            'low_queue_threshold'      => $this->low_queue_threshold,
            'critical_queue_threshold' => $this->critical_queue_threshold,
            'is_active'               => $this->is_active,
            'is_public'               => $this->is_public,
            'prefix'                  => $this->prefix,
            'embed_url'               => $this->embed_url,
            'total_clicks'            => $this->total_clicks,
            'total_conversions'       => $this->total_conversions,
            'total_earnings'          => (float) $this->total_earnings,

            // Computed attributes
            'queue_count'             => $this->queue_count,
            'active_link_url'         => $this->active_link_url,
            'is_queue_low'            => $this->is_queue_low,
            'is_empty'                => $this->is_empty,

            // Counts injected via withCount()
            'queued_links_count'      => $this->whenCounted('links as queued_links_count'),

            'created_at'              => $this->created_at?->toIso8601String(),
            'updated_at'              => $this->updated_at?->toIso8601String(),
        ];
    }
}
