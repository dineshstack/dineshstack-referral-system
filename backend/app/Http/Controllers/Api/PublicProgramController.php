<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProgramResource;
use App\Models\Program;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicProgramController extends Controller
{
    /**
     * GET /api/public/programs
     *
     * Returns all programs that are both active and marked as public.
     * No authentication required — safe for embedding on external sites.
     */
    public function index(): AnonymousResourceCollection
    {
        $programs = Program::where('is_active', true)
            ->where('is_public', true)
            ->withCount([
                'clickEvents as clicks_30d' => fn ($q) => $q
                    ->where('created_at', '>=', now()->subDays(30))
                    ->where('is_bot', false),
            ])
            ->orderBy('name')
            ->get();

        return PublicProgramResource::collection($programs);
    }
}
