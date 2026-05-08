<?php

use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Public redirect routes. Each prefix maps to the same controller — the
| prefix is chosen per-program to match the reader's intent:
|
|   /tools/{slug}   dineshstack.com/tools/hosting       (curated tool list)
|   /deals/{slug}   dineshstack.com/deals/vpn           (discount framing)
|   /get/{slug}     dineshstack.com/get/server          (setup wizard step)
|   /start/{slug}   dineshstack.com/start/hosting       (onboarding guide)
|   /{slug}         dineshstack.com/hosting             (cleanest, root level)
|
| /go/{slug} is kept for backward compatibility with existing published links.
*/

Route::get('/tools/{slug}',  [RedirectController::class, 'redirect'])->name('referral.tools');
Route::get('/deals/{slug}',  [RedirectController::class, 'redirect'])->name('referral.deals');
Route::get('/get/{slug}',    [RedirectController::class, 'redirect'])->name('referral.get');
Route::get('/start/{slug}',  [RedirectController::class, 'redirect'])->name('referral.start');

// Legacy — kept so old published /go/ links still work
Route::get('/go/{slug}',     [RedirectController::class, 'redirect'])->name('referral.redirect');

// Root-level (cleanest slug — must be last to avoid shadowing routes above)
Route::get('/{slug}',        [RedirectController::class, 'redirect'])
    ->name('referral.root')
    ->where('slug', '[a-z0-9][a-z0-9\-]*');
