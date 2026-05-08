# DineshStack Referral System

> **Auto-rotate your affiliate links, track every click, and never lose a commission again.**

A full-stack affiliate link rotation and management system built with **Laravel 13** + **Next.js 16**. Drop in one permanent link on your blog or YouTube — the backend silently serves a fresh one-time affiliate URL on every visit, rotates the queue automatically, and alerts you before it runs dry.

[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Why This Exists

Affiliate programs like **Hostinger** and **NordVPN** issue one-time referral links — each URL can only be used once, or expires after a purchase. Most creators manage these manually in a spreadsheet, which means:

- Forgetting to update links → sending traffic to dead URLs
- Copy-pasting the wrong link → losing commissions
- No idea which blog post or video drives actual sales

This system solves all three. You get **one permanent URL** to embed everywhere. The backend handles the rest.

---

## How It Works

```
Visitor clicks → dineshstack.com/go/hostinger
                        ↓
            Laravel RedirectController
                        ↓
            Bot detected? → log & serve (don't consume)
            Rate limited?  → redirect to homepage
                        ↓
            Fetch ACTIVE link from queue (row-locked)
                        ↓
            Redirect visitor to real affiliate URL (302)
                        ↓
            Mark link as USED → promote next QUEUED link
                        ↓
            Queue low?  → Email + Telegram warning
            Queue empty → Email + Telegram + Discord 🚨
```

---

## Features

### Core
- **Auto-rotating link queue** — one-time links served FIFO, permanent links served indefinitely
- **One permanent embed URL** — `/go/{slug}` never changes; swap the backend queue anytime
- **Race-condition safe** — DB row-level locks prevent two visitors from consuming the same link simultaneously
- **Supports both link types** — one-time (Hostinger, NordVPN) and permanent (Canva, tools)

### Analytics
- **Click tracking** — every hit logged with IP, referrer, country, user agent
- **UTM pass-through** — `?utm_source=blog` appended to every redirect and stored in the database
- **Bot detection** — 20 UA patterns blocked from consuming one-time links, counted separately in stats
- **Per-IP rate limiting** — prevents a single IP from burning multiple links (configurable)
- **Country breakdown** — auto-resolved via ip-api.com batch API, no API key required
- **Top referrers & UTM sources** — know which blog post or video drives the most clicks

### Alerts (3 channels, escalating severity)
| Level | Trigger | Channels |
|-------|---------|---------|
| Low | Queue < `low_queue_threshold` | Email + Telegram |
| Critical | Queue ≤ `critical_queue_threshold` | Email + Telegram + **Discord** |
| Empty | No active or queued links | All channels, loudest message |

### Automation (Scheduled Commands)
| Schedule | Command | Does |
|----------|---------|------|
| Every 5 min | `referral:update-countries` | Batch-resolves IPs → ISO country codes |
| Hourly | `referral:check-expiry` | Expires overdue links, promotes next in queue |
| Daily 3 AM | `referral:check-health` | HTTP HEAD-checks every active/queued link, alerts on dead URLs |
| Daily 8 AM | `referral:daily-digest` | Morning summary via Telegram + email |

### Conversion Tracking
- **Postback webhook** — affiliate networks POST conversions to `/api/postback?secret=XXX&program=hostinger`
- **Earnings tracking** — `total_earnings` updated automatically on confirmed sales
- **Full payload storage** — raw postback JSON preserved for auditing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Laravel 13 · PHP 8.4 · Sanctum token auth |
| Database | MySQL (row-level locks for race safety) |
| Frontend | Next.js 16.2 · React 19 · TypeScript 5.7 |
| UI | shadcn/ui · Tailwind CSS v3 · Lucide icons |
| Notifications | SMTP email · Telegram Bot API · Discord Webhooks |
| Country detection | ip-api.com (free, no API key) |
| Toasts | Sonner |

---

## Quick Start

> Prerequisites: PHP 8.4, Composer, Node.js 20+, MySQL

### 1 — Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database credentials, then:

```bash
php artisan migrate
php artisan db:seed
# ↑ Outputs your API token — copy it
```

Start the server:
```bash
php artisan serve
# Running at http://127.0.0.1:8000
```

### 2 — Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Paste the token from the seeder into `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_TOKEN=your-token-from-seeder
NEXT_PUBLIC_APP_URL=http://127.0.0.1:8000
```

```bash
npm run dev
# Dashboard at http://localhost:3000
```

### 3 — Test a redirect

```bash
curl -I http://127.0.0.1:8000/go/hostinger
# HTTP/1.1 302 Found  →  Location: https://hostinger.com?ref=YOUR_CODE
```

---

## Configuration

### Notifications

```env
# Email
REFERRAL_NOTIFY_EMAIL=you@yourdomain.com

# Telegram — create a bot via @BotFather, then:
# visit https://api.telegram.org/bot<TOKEN>/getUpdates to find your chat_id
TELEGRAM_BOT_TOKEN=123456789:AABBccDDeEfFgGhH...
TELEGRAM_CHAT_ID=987654321

# Discord — Server Settings → Integrations → Webhooks → New Webhook → Copy URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Postback secret — give this to your affiliate networks
POSTBACK_SECRET=change_me_to_something_random
```

### Rate Limiting

```env
REDIRECT_RATE_LIMIT_MAX=3       # max clicks per IP per program
REDIRECT_RATE_LIMIT_MINUTES=60  # within this window
```

### Cron (production)

Add one cron entry on your server — Laravel handles the rest:

```cron
* * * * * php /path/to/backend/artisan schedule:run >> /dev/null 2>&1
```

---

## API Reference

All endpoints require `Authorization: Bearer <token>` except the redirect and postback routes.

### Programs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/programs` | List all programs |
| `POST` | `/api/programs` | Create a program |
| `GET` | `/api/programs/{id}` | Program detail + recent clicks |
| `PUT` | `/api/programs/{id}` | Update a program |
| `DELETE` | `/api/programs/{id}` | Delete a program |

### Link Queue

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/programs/{id}/links` | All links (active, queued, used, expired) |
| `POST` | `/api/programs/{id}/links` | Add links to queue |
| `DELETE` | `/api/programs/{id}/links/{linkId}` | Remove a link |

### Analytics & Postback

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics?days=30` | Clicks, UTM sources, countries, top referrers |
| `POST` | `/api/postback?secret=XXX&program=hostinger` | Receive conversion from affiliate network |

### Public Redirect (no auth)

```
GET /go/{slug}[?utm_source=blog&utm_medium=article&utm_campaign=may]
```

Responds with `302` to the active affiliate URL. UTM parameters are logged **and** forwarded to the destination.

---

## Artisan Commands

```bash
# Expire overdue links + promote next in queue
php artisan referral:check-expiry

# Resolve IP → country for unresolved clicks (uses ip-api.com free tier)
php artisan referral:update-countries --limit=500

# HTTP HEAD-check all active/queued links (add --force to re-check all)
php artisan referral:check-health
php artisan referral:check-health --force

# Send daily digest manually (override date with --date=YYYY-MM-DD)
php artisan referral:daily-digest
php artisan referral:daily-digest --date=2026-05-07
```

---

## Embed Your Links

Place this URL in every blog post, YouTube description, and email:

```
https://yourdomain.com/go/hostinger
```

### HTML
```html
<a href="https://yourdomain.com/go/hostinger" target="_blank" rel="nofollow sponsored">
  Get Hostinger — best deal available →
</a>
```

### Markdown
```markdown
[Get Hostinger →](https://yourdomain.com/go/hostinger)
```

> **Pro tip:** Append UTM parameters to track exactly where your clicks come from:
> `https://yourdomain.com/go/hostinger?utm_source=youtube&utm_medium=description&utm_campaign=hosting-tutorial`

---

## Adding an Affiliate Program

```http
POST /api/programs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "NordVPN",
  "slug": "nordvpn",
  "category": "VPN",
  "icon": "🔵",
  "color": "#3b82f6",
  "commission": "40%",
  "link_type": "onetime",
  "affiliate_dashboard_url": "https://affiliates.nordvpn.com",
  "low_queue_threshold": 5,
  "critical_queue_threshold": 2,
  "initial_links": [
    "https://nordvpn.com?ref=CODE_001",
    "https://nordvpn.com?ref=CODE_002"
  ]
}
```

Use `"link_type": "permanent"` for tools like Canva or ConvertKit where one link works for everyone.

---

## Project Structure

```
referral-system/
├── backend/                          # Laravel 13 API
│   ├── app/
│   │   ├── Console/Commands/         # Scheduled automation commands
│   │   │   ├── CheckLinkExpiry.php
│   │   │   ├── CheckLinkHealth.php
│   │   │   ├── SendDailyDigest.php
│   │   │   └── UpdateClickCountries.php
│   │   ├── Http/Controllers/Api/     # REST API controllers
│   │   ├── Models/                   # Program, ReferralLink, ClickEvent, PostbackEvent
│   │   ├── Notifications/            # Email + Telegram queue alerts
│   │   └── Services/
│   │       └── LinkRotationService.php   # Core rotation logic
│   ├── database/migrations/
│   └── routes/
│       ├── api.php                   # Authenticated API + postback webhook
│       └── web.php                   # Public /go/{slug} redirect
│
└── frontend/                         # Next.js 16 dashboard
    └── src/
        ├── app/                      # App Router pages
        ├── components/               # Dashboard, Analytics, Program detail
        ├── lib/
        │   ├── api.ts                # Typed Axios client
        │   └── utils.ts
        └── types/index.ts            # Shared TypeScript types
```

---

## Database Schema (summary)

```
programs          — name, slug, link_type, thresholds, totals
referral_links    — url, status (queued/active/used/expired), position, expires_at, health_status
click_events      — program, ip, country, referer, utm_source/medium/campaign, is_bot
postback_events   — program, event_type, amount, currency, transaction_id, raw_payload
```

---

## License

MIT — use it, fork it, build on it.

---

## ⭐ Built and taught by DineshStack

This project is part of the **DineshStack full-stack series** — real-world systems built from scratch, explained step by step.

### 🎯 Want to build this yourself?

**[→ Watch the full tutorial on DineshStack](https://dineshstack.com)**

You'll learn:
- How to architect a Laravel API with Sanctum token auth
- How to build a Next.js App Router dashboard with shadcn/ui
- How to handle race conditions with database row locks
- How to wire up Telegram, Discord, and email notifications
- How to track affiliate conversions end-to-end

### 🔔 Stay updated

If this repo helped you, the best way to say thanks:

**[⭐ Star this repository](https://github.com/dineshstack/referral-system)** — it helps others find it.

**[📺 Subscribe on YouTube](https://youtube.com/@dineshstack)** — new full-stack builds every week.

**[🌐 Visit DineshStack.com](https://dineshstack.com)** — tutorials, source code, and more systems like this one.

---

*Built with Laravel 13 · Next.js 16 · shadcn/ui · Tailwind CSS*