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
            'link_type'  => $this->link_type,
            'prefix'     => $this->prefix,
            'embed_url'  => $this->embed_url,
            'total_clicks' => $this->total_clicks,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
