<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category',
        'icon',
        'color',
        'commission',
        'link_type',
        'prefix',
        'affiliate_dashboard_url',
        'low_queue_threshold',
        'critical_queue_threshold',
        'is_active',
        'total_clicks',
        'total_conversions',
        'total_earnings',
    ];

    // PHP 8.4 — casts() method (preferred over $casts property in Laravel 11+)
    protected function casts(): array
    {
        return [
            'is_active'                => 'boolean',
            'total_clicks'             => 'integer',
            'total_conversions'        => 'integer',
            'total_earnings'           => 'decimal:2',
            'low_queue_threshold'      => 'integer',
            'critical_queue_threshold' => 'integer',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function links(): HasMany
    {
        return $this->hasMany(ReferralLink::class);
    }

    public function clickEvents(): HasMany
    {
        return $this->hasMany(ClickEvent::class);
    }

    public function postbackEvents(): HasMany
    {
        return $this->hasMany(PostbackEvent::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function activeLink(): ?ReferralLink
    {
        return $this->links()->where('status', 'active')->first();
    }

    public function queueCount(): int
    {
        return $this->links()->where('status', 'queued')->count();
    }

    public function isQueueLow(): bool
    {
        return $this->queueCount() < $this->low_queue_threshold;
    }

    public function isEmpty(): bool
    {
        return !$this->activeLink() && $this->queueCount() === 0;
    }

    // ── Appended Attributes (serialised in every API response) ─────────────────

    protected $appends = [
        'queue_count',
        'active_link_url',
        'is_queue_low',
        'is_empty',
        'embed_url',
    ];

    public function getQueueCountAttribute(): int
    {
        return $this->queueCount();
    }

    public function getActiveLinkUrlAttribute(): ?string
    {
        return $this->activeLink()?->url;
    }

    public function getIsQueueLowAttribute(): bool
    {
        return $this->isQueueLow();
    }

    public function getIsEmptyAttribute(): bool
    {
        return $this->isEmpty();
    }

    public function getEmbedUrlAttribute(): string
    {
        $base = rtrim(config('app.url'), '/');

        return $this->prefix === 'root'
            ? "{$base}/{$this->slug}"
            : "{$base}/{$this->prefix}/{$this->slug}";
    }
}
