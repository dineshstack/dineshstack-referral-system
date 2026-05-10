<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddLinksRequest;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Http\Resources\ClickEventResource;
use App\Http\Resources\ProgramResource;
use App\Http\Resources\ReferralLinkResource;
use App\Models\ClickEvent;
use App\Models\Program;
use App\Models\ReferralLink;
use App\Services\LinkRotationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    public function __construct(private readonly LinkRotationService $rotator) {}

    // ── GET /api/programs ──────────────────────────────────────────────────────
    public function index(): AnonymousResourceCollection
    {
        $programs = Program::with(['links' => fn ($q) => $q->where('status', 'active')])
            ->withCount([
                'links as queued_links_count' => fn ($q) => $q->where('status', 'queued'),
            ])
            ->orderByDesc('created_at')
            ->get();

        return ProgramResource::collection($programs);
    }

    // ── POST /api/programs ─────────────────────────────────────────────────────
    public function store(StoreProgramRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $program = Program::create([
            ...$validated,
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
        ]);

        if (!empty($validated['initial_links'])) {
            $this->rotator->addLinksToQueue($program, $validated['initial_links']);
        }

        return (new ProgramResource($program->refresh()))
            ->response()
            ->setStatusCode(201)
            ->withHeaders(['X-Message' => 'Program created']);
    }

    // ── GET /api/programs/{program} ────────────────────────────────────────────
    public function show(Program $program): JsonResponse
    {
        $program->load(['links' => function ($q) {
            $q->whereIn('status', ['active', 'queued'])->orderBy('position');
        }]);

        $recentClicks = $program->clickEvents()
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'data'          => new ProgramResource($program),
            'recent_clicks' => ClickEventResource::collection($recentClicks),
        ]);
    }

    // ── PUT /api/programs/{program} ────────────────────────────────────────────
    public function update(UpdateProgramRequest $request, Program $program): JsonResponse
    {
        $program->update($request->validated());

        return response()->json([
            'data'    => new ProgramResource($program->fresh()),
            'message' => 'Program updated',
        ]);
    }

    // ── DELETE /api/programs/{program} ─────────────────────────────────────────
    public function destroy(Program $program): JsonResponse
    {
        $program->delete();

        return response()->json(['message' => 'Program deleted']);
    }

    // ── GET /api/programs/{program}/links ──────────────────────────────────────
    public function getLinks(Program $program): AnonymousResourceCollection
    {
        $links = $program->links()
            ->orderByRaw("FIELD(status, 'active', 'queued', 'used', 'expired')")
            ->orderBy('position')
            ->get();

        return ReferralLinkResource::collection($links);
    }

    // ── POST /api/programs/{program}/links ─────────────────────────────────────
    public function addLinks(AddLinksRequest $request, Program $program): JsonResponse
    {
        $added = $this->rotator->addLinksToQueue($program, $request->validated('links'));

        return response()->json([
            'message'     => "{$added} link(s) added to queue",
            'queue_count' => $program->fresh()->queueCount(),
            'active_link' => $program->fresh()->active_link_url,
        ]);
    }

    // ── DELETE /api/programs/{program}/links/{linkId} ──────────────────────────
    public function removeLink(Program $program, int $linkId): JsonResponse
    {
        $link = $program->links()->findOrFail($linkId);

        if ($link->status === 'active') {
            $link->update(['status' => 'expired']);
            $next = $this->rotator->promoteNextFromQueue($program);
            $msg  = $next
                ? 'Active link removed — next link promoted.'
                : 'Active link removed. Queue is now empty!';
        } else {
            $link->update(['status' => 'expired']);
            $msg = 'Link removed from queue.';
        }

        return response()->json([
            'message'     => $msg,
            'queue_count' => $program->fresh()->queueCount(),
        ]);
    }

    // ── PATCH /api/programs/{program}/links/{linkId}/requeue ───────────────────
    public function requeueLink(Program $program, int $linkId): JsonResponse
    {
        $link = $program->links()->findOrFail($linkId);

        if (!in_array($link->status, ['used', 'expired'])) {
            return response()->json(['message' => 'Only used or expired links can be re-queued.'], 422);
        }

        $hasActive = $program->links()->where('status', 'active')->exists();

        if ($hasActive) {
            $link->update(['status' => 'queued', 'used_at' => null, 'expires_at' => null]);
            $msg = 'Link re-queued successfully.';
        } else {
            $link->update(['status' => 'active', 'used_at' => null, 'expires_at' => null, 'activated_at' => now()]);
            $msg = 'Link restored and set as active (no active link existed).';
        }

        return response()->json([
            'message'     => $msg,
            'queue_count' => $program->fresh()->queueCount(),
        ]);
    }

    // ── GET /api/analytics ─────────────────────────────────────────────────────
    public function analytics(Request $request): JsonResponse
    {
        $days  = (int) $request->input('days', 30);
        $since = now()->subDays($days);

        $programs = Program::withCount([
            'links as queued_count' => fn ($q) => $q->where('status', 'queued'),
            'links as used_count'   => fn ($q) => $q->where('status', 'used'),
        ])->get();

        $clicksPerDay = ClickEvent::selectRaw('DATE(created_at) as date, COUNT(*) as clicks, SUM(is_bot) as bot_clicks')
            ->where('created_at', '>=', $since)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $topReferers = ClickEvent::selectRaw('referer, COUNT(*) as count')
            ->whereNotNull('referer')
            ->where('is_bot', false)
            ->where('created_at', '>=', $since)
            ->groupBy('referer')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $utmSources = ClickEvent::selectRaw('COALESCE(utm_source, "(none)") as source, COUNT(*) as count')
            ->where('is_bot', false)
            ->where('created_at', '>=', $since)
            ->groupBy('source')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $topCountries = ClickEvent::selectRaw('country, COUNT(*) as count')
            ->whereNotNull('country')
            ->where('is_bot', false)
            ->where('created_at', '>=', $since)
            ->groupBy('country')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $allClicks  = ClickEvent::where('created_at', '>=', $since)->count();
        $botClicks  = ClickEvent::where('created_at', '>=', $since)->where('is_bot', true)->count();

        return response()->json([
            'programs'       => ProgramResource::collection($programs),
            'clicks_per_day' => $clicksPerDay,
            'top_referers'   => $topReferers,
            'utm_sources'    => $utmSources,
            'top_countries'  => $topCountries,
            'totals'         => [
                'clicks'      => $allClicks,
                'bot_clicks'  => $botClicks,
                'real_clicks' => $allClicks - $botClicks,
                'conversions' => ClickEvent::where('link_was_rotated', true)
                                    ->where('created_at', '>=', $since)->count(),
                'queue_total' => ReferralLink::where('status', 'queued')->count(),
                'earnings'    => (float) Program::sum('total_earnings'),
            ],
        ]);
    }
}
