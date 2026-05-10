<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Allow the Next.js frontend to reach the API.
    | Set FRONTEND_URL in .env to your production domain.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'up'],

    'allowed_methods' => ['*'],

    // Authenticated dashboard routes only need the frontend origin.
    // The public API (api/public/*) is called by external embeds, so we allow
    // all origins there — done via allowed_origins_patterns below.
    'allowed_origins' => array_filter(
        array_map('trim', explode(',', env('FRONTEND_URL_CORS', 'http://localhost:3000')))
    ),

    // Allow any origin to call the public programs endpoint (used for external embeds).
    'allowed_origins_patterns' => ['#.*#'],

    'allowed_headers' => [

        'Content-Type',

        'X-Requested-With',

        'Authorization',

        'Accept',

        'Accept-Language',

        'Origin',

        'X-HTTP-Method-Override',

    ],

    'exposed_headers' => [],

    // Cache preflight responses for 24 hours to reduce repeated OPTIONS requests
    'max_age' => 86400,

    // Must remain FALSE — this API uses Passport Bearer tokens, not cookies.
    // Setting this to true would require Access-Control-Allow-Credentials: true
    // which is incompatible with wildcard origins and not needed here.
    'supports_credentials' => false,

];
