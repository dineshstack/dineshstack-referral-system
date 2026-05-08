<?php

use App\Console\Commands\CheckLinkExpiry;
use App\Console\Commands\CheckLinkHealth;
use App\Console\Commands\SendDailyDigest;
use App\Console\Commands\UpdateClickCountries;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule): void {
        // Expire overdue links and promote the next one
        $schedule->command(CheckLinkExpiry::class)->hourly();

        // Resolve IP → country for click events with a NULL country
        $schedule->command(UpdateClickCountries::class)->everyFiveMinutes();

        // HTTP HEAD-check all active/queued links once a day (low-traffic window)
        $schedule->command(CheckLinkHealth::class)->dailyAt('03:00');

        // Morning performance summary via Telegram + email
        $schedule->command(SendDailyDigest::class)->dailyAt('08:00');
    })
    ->withMiddleware(function (Middleware $middleware): void {
        // This project uses Sanctum *token* auth (Authorization: Bearer …), not SPA
        // cookie auth — so EnsureFrontendRequestsAreStateful must NOT be added to the
        // api group, otherwise Laravel enables CSRF verification for requests from the
        // stateful domains list (localhost:3000) and every mutating request returns 419.

        $middleware->alias([
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        ]);

        // Trust all proxies — required when running behind nginx/load balancer
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API routes when resource not found
        $exceptions->render(function (NotFoundHttpException $_, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Not found.'], 404);
            }
        });
    })
    ->create();
