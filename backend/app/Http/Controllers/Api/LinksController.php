<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReferralLinkResource;
use App\Models\ReferralLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $allowed  = ['created_at', 'used_at', 'status', 'position', 'program_id'];
        $sort     = in_array($request->input('sort'), $allowed) ? $request->input('sort') : 'created_at';
        $dir      = $request->input('dir') === 'asc' ? 'asc' : 'desc';
        $perPage  = min((int) $request->input('per_page', 20), 100);

        $paginated = ReferralLink::with('program:id,name,icon,color,slug')
            ->when($request->filled('program_id'), fn ($q) => $q->where('program_id', (int) $request->program_id))
            ->when($request->filled('status'),     fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('health'),     fn ($q) => $q->where('health_status', $request->health))
            ->when($request->filled('search'),     fn ($q) => $q->where('url', 'like', "%{$request->search}%"))
            ->orderBy($sort, $dir)
            ->paginate($perPage);

        return response()->json([
            'data' => ReferralLinkResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'from'         => $paginated->firstItem(),
                'to'           => $paginated->lastItem(),
            ],
        ]);
    }
}
