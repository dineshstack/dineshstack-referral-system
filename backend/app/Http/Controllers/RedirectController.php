<?php
// app/Http/Controllers/RedirectController.php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Services\LinkRotationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\RateLimiter;

class RedirectController extends Controller
{
    public function __construct(private LinkRotationService $rotator) {}

    /**
     * GET /go/{slug}[?utm_source=blog&utm_medium=post&utm_campaign=may]
     * Public redirect endpoint — this is the URL you embed everywhere.
     */
    public function redirect(Request $request, string $slug): RedirectResponse
    {
        $program = Program::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $isBot = $this->isBot($request->userAgent() ?? '');

        // Rate-limit real visitors only — bots are logged but never blocked here;
        // they are blocked from consuming one-time links inside handleClick().
        if (!$isBot && $this->isRateLimited($request->ip() ?? '0.0.0.0', $slug)) {
            // Still redirect them to the home page; don't expose a 429 to visitors
            return redirect(config('app.url') . '?ref_limited=' . $slug, 302);
        }

        $utm = $this->extractUtm($request);

        $url = $this->rotator->handleClick($program, [
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer'    => $request->headers->get('referer'),
            'utm_source'   => $utm['utm_source'],
            'utm_medium'   => $utm['utm_medium'],
            'utm_campaign' => $utm['utm_campaign'],
            'is_bot'     => $isBot,
        ]);

        if (!$url) {
            return redirect(config('app.url') . '?ref_unavailable=' . $slug, 302);
        }

        // Append UTM params to the destination URL so the affiliate network sees them
        $url = $this->appendUtmToUrl($url, $utm);

        return redirect()->away($url, 302);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function extractUtm(Request $request): array
    {
        return [
            'utm_source'   => $request->query('utm_source'),
            'utm_medium'   => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
        ];
    }

    private function appendUtmToUrl(string $url, array $utm): string
    {
        $params = array_filter($utm); // remove nulls/empty strings
        if (empty($params)) {
            return $url;
        }

        $separator = str_contains($url, '?') ? '&' : '?';
        return $url . $separator . http_build_query($params);
    }

    private function isBot(string $userAgent): bool
    {
        if (empty($userAgent)) {
            return true;
        }

        $ua = strtolower($userAgent);
        foreach (config('referral.bot_ua_patterns', []) as $pattern) {
            if (str_contains($ua, strtolower($pattern))) {
                return true;
            }
        }

        return false;
    }

    private function isRateLimited(string $ip, string $slug): bool
    {
        $key     = "redirect:{$slug}:{$ip}";
        $max     = config('referral.rate_limit_max', 3);
        $minutes = config('referral.rate_limit_minutes', 60);

        return !RateLimiter::attempt(
            $key,
            $max,
            fn () => null,          // no-op callback — we only care about the attempt count
            $minutes * 60           // decay in seconds
        );
    }
}