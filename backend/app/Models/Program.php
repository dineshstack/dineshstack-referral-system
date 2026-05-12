<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int         $id
 * @property int|null    $parent_id
 * @property string      $name
 * @property string      $slug
 * @property string|null $category
 * @property string|null $icon
 * @property string|null $color
 * @property string|null $commission
 * @property string      $link_type
 * @property string      $prefix
 * @property string|null $affiliate_dashboard_url
 * @property int         $low_queue_threshold
 * @property int         $critical_queue_threshold
 * @property bool        $is_active
 * @property bool        $is_public
 * @property int         $total_clicks
 * @property int         $total_conversions
 * @property string      $total_earnings
 * @property string      $created_at
 * @property string      $updated_at
 * — Appended
 * @property int         $queue_count
 * @property string|null $active_link_url
 * @property bool        $is_queue_low
 * @property bool        $is_empty
 * @property string      $embed_url
 */
class Program extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'category',
        'icon',
        'color',
        'commission',
        'link_type',
        'prefix',
        'affiliate_dashboard_url',
        'referral_benefit',
        'exclusive_note',
        'last_verified_at',
        'login_email',
        'login_password',
        'login_method',
        'low_queue_threshold',
        'critical_queue_threshold',
        'is_active',
        'is_public',
        'total_clicks',
        'total_conversions',
        'total_earnings',
    ];

    // PHP 8.4 — casts() method (preferred over $casts property in Laravel 11+)
    protected function casts(): array
    {
        return [
            'is_active'                => 'boolean',
            'is_public'                => 'boolean',
            'last_verified_at'         => 'datetime',
            'total_clicks'             => 'integer',
            'total_conversions'        => 'integer',
            'total_earnings'           => 'decimal:2',
            'low_queue_threshold'      => 'integer',
            'critical_queue_threshold' => 'integer',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Program::class, 'parent_id')->orderBy('name');
    }

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
        $base = rtrim(config('referral.site_url'), '/');

        return $this->prefix === 'root'
            ? "{$base}/{$this->slug}"
            : "{$base}/{$this->prefix}/{$this->slug}";
    }
}
