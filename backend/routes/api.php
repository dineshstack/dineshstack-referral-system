<?php
// routes/api.php  — prefix: /api

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostbackController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\PublicProgramController;
use Illuminate\Support\Facades\Route;

// ── Public routes ─────────────────────────────────────────────────────────────

Route::post('login', [AuthController::class, 'login']);

// Public deals feed — no auth, safe for external sites (0360_web, dineshstack blog)
Route::get('public/programs', [PublicProgramController::class, 'index']);

// Affiliate network conversion postback — authenticated via ?secret= query param.
Route::post('postback', [PostbackController::class, 'receive']);

// ── Authenticated routes (Sanctum token) ─────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    Route::post('logout',  [AuthController::class, 'logout']);
    Route::get ('user',    [AuthController::class, 'user']);

    // Programs CRUD
    Route::apiResource('programs', ProgramController::class);

    // Link queue management
    Route::get   ('programs/{program}/links',          [ProgramController::class, 'getLinks']);
    Route::post  ('programs/{program}/links',          [ProgramController::class, 'addLinks']);
    Route::delete('programs/{program}/links/{linkId}', [ProgramController::class, 'removeLink']);

    // Analytics
    Route::get('analytics', [ProgramController::class, 'analytics']);
});
