<?php
// config/referral.php
// Add these to your .env file too (see .env.example below)

return [
    /*
    |--------------------------------------------------------------------------
    | Site URL (redirect domain)
    |--------------------------------------------------------------------------
    | The public-facing domain where redirect links live.
    | This is DIFFERENT from APP_URL (which is the API domain).
    | Example: APP_URL=https://api-referral-system.orions360.com
    |          SITE_URL=https://deals.orions360.com
    */
    'site_url' => env('SITE_URL', env('APP_URL')),

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    */
    'notify_email' => env('REFERRAL_NOTIFY_EMAIL', ''),

    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Settings
    |--------------------------------------------------------------------------
    | 1. Create a bot via @BotFather on Telegram
    | 2. Get the token and paste below
    | 3. Start a chat with your bot, then visit:
    |    https://api.telegram.org/bot<TOKEN>/getUpdates  to find your chat_id
    */
    'telegram_bot_token' => env('TELEGRAM_BOT_TOKEN', ''),
    'telegram_chat_id'   => env('TELEGRAM_CHAT_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | Discord Webhook (optional)
    |--------------------------------------------------------------------------
    | Create an Incoming Webhook in your Discord server:
    | Server Settings → Integrations → Webhooks → New Webhook → Copy URL
    | Paste as DISCORD_WEBHOOK_URL in your .env
    */
    'discord_webhook_url' => env('DISCORD_WEBHOOK_URL', ''),

    /*
    |--------------------------------------------------------------------------
    | Postback Secret
    |--------------------------------------------------------------------------
    | Affiliate networks POST conversion events to /api/postback?secret=XXX
    | Set POSTBACK_SECRET in .env and give it to your affiliate network.
    */
    'postback_secret' => env('POSTBACK_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | Bot Detection
    |--------------------------------------------------------------------------
    | User-agent substrings (case-insensitive) that identify bots.
    | Matched clicks are logged as is_bot=true and do NOT consume one-time links.
    */
    'bot_ua_patterns' => [
        'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
        'slurp', 'facebot', 'ia_archiver', 'sogou', 'exabot',
        'curl/', 'wget/', 'python-requests', 'go-http-client',
        'java/', 'okhttp', 'libwww-perl', 'scrapy', 'axios/',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    | Max clicks per unique IP per program within the window (minutes).
    | Prevents a single IP from consuming multiple one-time links.
    */
    'rate_limit_max'     => (int) env('REDIRECT_RATE_LIMIT_MAX', 3),
    'rate_limit_minutes' => (int) env('REDIRECT_RATE_LIMIT_MINUTES', 60),
];

/*
|------------------------------------------------------------------------------
| .env additions (copy these to your .env file)
|------------------------------------------------------------------------------

REFERRAL_NOTIFY_EMAIL=dinesh@dineshstack.com

TELEGRAM_BOT_TOKEN=123456789:AABBccDDeeFfGgHhIiJjKkLlMmNnOoPpQqRr
TELEGRAM_CHAT_ID=987654321

|------------------------------------------------------------------------------
*/
