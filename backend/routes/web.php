<?php

use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| The public redirect route. This is the URL you embed in blog posts and
| YouTube descriptions: https://dineshstack.com/go/{slug}
*/

Route::get('/go/{slug}', [RedirectController::class, 'redirect'])
    ->name('referral.redirect');
