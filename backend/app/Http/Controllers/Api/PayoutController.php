<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PayoutResource;
use App\Models\Payout;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PayoutController extends Controller
{
    // GET /api/programs/{program}/payouts
    public function index(Program $program): AnonymousResourceCollection
    {
        $payouts = $program->payouts()->orderByDesc('paid_at')->get();

        return PayoutResource::collection($payouts);
    }

    // POST /api/programs/{program}/payouts
    public function store(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'currency'       => ['nullable', 'string', 'max:10'],
            'paid_at'        => ['required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);

        $payout = $program->payouts()->create([
            'amount'         => $validated['amount'],
            'currency'       => $validated['currency'] ?? 'USD',
            'paid_at'        => $validated['paid_at'],
            'payment_method' => $validated['payment_method'] ?? null,
            'notes'          => $validated['notes'] ?? null,
        ]);

        // Keep program total_earnings in sync
        $program->increment('total_earnings', $validated['amount']);

        return (new PayoutResource($payout))
            ->response()
            ->setStatusCode(201);
    }

    // DELETE /api/programs/{program}/payouts/{payout}
    public function destroy(Program $program, Payout $payout): JsonResponse
    {
        if ($payout->program_id !== $program->id) {
            abort(404);
        }

        // Reverse the earnings increment
        $program->decrement('total_earnings', $payout->amount);

        $payout->delete();

        return response()->json(['message' => 'Payout deleted']);
    }
}
