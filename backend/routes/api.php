<?php
// routes/api.php  — prefix: /api

use App\Http\Controllers\Api\PostbackController;
use App\Http\Controllers\Api\ProgramController;
use Illuminate\Support\Facades\Route;

// ── Public routes ─────────────────────────────────────────────────────────────

// Affiliate network conversion postback — authenticated via ?secret= query param.
// URL to give your affiliate networks: https://yoursite.com/api/postback?secret=XXX&program=hostinger
Route::post('postback', [PostbackController::class, 'receive']);

// ── Authenticated routes (Sanctum token) ─────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Programs CRUD
    Route::apiResource('programs', ProgramController::class);

    // Link queue management
    Route::get   ('programs/{program}/links',          [ProgramController::class, 'getLinks']);
    Route::post  ('programs/{program}/links',          [ProgramController::class, 'addLinks']);
    Route::delete('programs/{program}/links/{linkId}', [ProgramController::class, 'removeLink']);

    // Analytics
    Route::get('analytics', [ProgramController::class, 'analytics']);
});
