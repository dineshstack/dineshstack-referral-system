<?php
// app/Http/Controllers/Api/PostbackController.php
//
// Affiliate networks POST conversion events here when a sale/lead is confirmed.
//
// Example URL you give to Hostinger / NordVPN:
//   https://dineshstack.com/api/postback?secret=YOUR_SECRET&program=hostinger
//
// Typical payload shape (varies by network):
//   { "event": "sale", "amount": "49.99", "currency": "USD", "transaction_id": "TXN123" }

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PostbackEvent;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PostbackController extends Controller
{
    public function receive(Request $request): JsonResponse
    {
        // Validate the shared secret
        $secret = config('referral.postback_secret');
        if ($secret && $request->query('secret') !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Resolve the program by slug (passed as ?program=hostinger)
        $slug    = $request->query('program');
        $program = $slug
            ? Program::where('slug', $slug)->first()
            : null;

        if (!$program) {
            return response()->json(['error' => 'Program not found'], 404);
        }

        $payload = $request->all();
        $amount  = $this->parseAmount($payload);

        // Record the postback
        $postback = PostbackEvent::create([
            'program_id'     => $program->id,
            'event_type'     => $payload['event'] ?? $payload['event_type'] ?? 'sale',
            'amount'         => $amount,
            'currency'       => strtoupper($payload['currency'] ?? 'USD'),
            'transaction_id' => $payload['transaction_id'] ?? $payload['txn_id'] ?? null,
            'raw_payload'    => $payload,
        ]);

        // Update program earnings
        if ($amount > 0) {
            $program->increment('total_earnings', $amount);
        }

        Log::info("Postback received for [{$program->slug}]: {$postback->event_type} \${$amount}");

        return response()->json(['status' => 'ok', 'id' => $postback->id]);
    }

    private function parseAmount(array $payload): float
    {
        $raw = $payload['amount'] ?? $payload['commission'] ?? $payload['revenue'] ?? 0;
        return (float) preg_replace('/[^0-9.]/', '', (string) $raw);
    }
}
