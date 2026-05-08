# DineshStack Referral Manager
### Laravel API + React Frontend — Full Auto-Rotation System

---

## How it works

```
Visitor clicks dineshstack.com/go/hostinger
         ↓
Laravel RedirectController
         ↓
LinkRotationService.handleClick()
    ├── Logs click to click_events table
    ├── Fetches current ACTIVE link from DB (with row lock)
    ├── Redirects visitor to the actual Hostinger affiliate URL
    ├── Marks the used link as status = 'used'
    ├── Promotes the next QUEUED link to status = 'active'
    └── If queue is low/empty → sends Telegram + Email notification
```

**Key insight:** You get the next Hostinger link automatically from your own queue — no API needed. You pre-load 5–10 links at once from Hostinger's affiliate panel, and they rotate one by one automatically.

---

## Backend Setup (Laravel)

### 1. Install Laravel
```bash
composer create-project laravel/laravel referral-backend
cd referral-backend
```

### 2. Copy backend files
Copy all files from `backend/` into your Laravel project root.

### 3. Install Sanctum (API auth)
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 4. Configure .env
```env
APP_URL=https://dineshstack.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=referral_db
DB_USERNAME=root
DB_PASSWORD=secret

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM_ADDRESS=you@gmail.com
MAIL_FROM_NAME="DineshStack Referrals"

# Your notification email
REFERRAL_NOTIFY_EMAIL=dinesh@dineshstack.com

# Telegram (see Telegram Setup below)
TELEGRAM_BOT_TOKEN=123456789:AABBccDDeeFfGgHhIiJjKkLlMmNnOoPpQqRr
TELEGRAM_CHAT_ID=987654321
```

### 5. Run migrations & seed
```bash
php artisan migrate
php artisan db:seed --class=ProgramSeeder
```

### 6. Add redirect route to routes/web.php
```php
use App\Http\Controllers\RedirectController;
Route::get('/go/{slug}', [RedirectController::class, 'redirect'])->name('referral.redirect');
```

### 7. Add API routes to routes/api.php
The file is already included — just make sure your `RouteServiceProvider` loads it.

### 8. Create an API token (for your dashboard)
```bash
php artisan tinker
>>> $user = \App\Models\User::first(); // or create one
>>> $token = $user->createToken('dashboard')->plainTextToken;
>>> echo $token;
```
Save this token — paste it in the React frontend `.env`.

---

## Frontend Setup (React + Vite)

### 1. Install dependencies
```bash
cd frontend
npm create vite@latest . -- --template react
npm install axios
```

### 2. Copy frontend files
Copy all files from `frontend/src/` into your Vite project's `src/` folder.

### 3. Configure .env.local
```env
VITE_API_URL=https://dineshstack.com/api
VITE_APP_URL=https://dineshstack.com
```

### 4. Set your API token
In your browser console or in `src/api/client.js`, set:
```js
localStorage.setItem('api_token', 'your-token-here');
```

### 5. Build & deploy
```bash
npm run build
# Upload /dist to your server's public_html or serve via nginx
```

---

## Telegram Bot Setup

1. Message **@BotFather** on Telegram → `/newbot` → follow steps → get token
2. Start a chat with your new bot (search its username)
3. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Find `"chat":{"id": 123456789}` — that's your `TELEGRAM_CHAT_ID`
5. Paste both into `.env`

You'll now receive messages like:
```
⚠️ Hostinger queue is LOW — only 2 link(s) left.
👉 Add links now: https://dineshstack.com/programs/1/links
🔗 Affiliate Dashboard: https://hostinger.com/affiliates
```

---

## How to get Hostinger links

Hostinger does NOT have a public API for affiliate links.
Here's the manual workflow (takes 2 minutes):

1. Log into https://www.hostinger.com/affiliates
2. Go to **My Referral Link** or **Create Link**
3. Generate 5–10 unique referral URLs
4. Copy all of them
5. In your dashboard → Programs → Hostinger → **+ Add Links**
6. Paste all links, click **Add**

Done! The system will serve them one at a time and notify you when to repeat.

---

## API Endpoints Reference

All endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/programs` | List all programs |
| POST   | `/api/programs` | Create program |
| GET    | `/api/programs/{id}` | Program + recent clicks |
| PUT    | `/api/programs/{id}` | Update program |
| DELETE | `/api/programs/{id}` | Delete program |
| GET    | `/api/programs/{id}/links` | All links for a program |
| POST   | `/api/programs/{id}/links` | Add links to queue |
| DELETE | `/api/programs/{id}/links/{linkId}` | Remove a link |
| GET    | `/api/analytics?days=30` | Analytics data |

Public redirect (no auth):
```
GET /go/{slug}  →  302 redirect to active referral URL
```

---

## Adding More Programs

Just add them via the dashboard or API:
```json
POST /api/programs
{
  "name": "NordVPN",
  "slug": "nordvpn",
  "category": "VPN",
  "icon": "🔵",
  "color": "#3b82f6",
  "commission": "40%",
  "link_type": "permanent",
  "affiliate_dashboard_url": "https://affiliates.nordvpn.com",
  "initial_links": ["https://nordvpn.com?ref=YOUR_CODE"]
}
```

Use `link_type: "permanent"` for NordVPN, Canva, etc. — links that never expire. These don't rotate, just click-count.

---

## Embed in Blog Posts

Use this in every blog post and YouTube description:
```
https://dineshstack.com/go/hostinger
```

Never change it — the backend handles which actual affiliate URL visitors land on.

### HTML:
```html
<a href="https://dineshstack.com/go/hostinger" target="_blank" rel="nofollow sponsored">
  Get Hostinger here →
</a>
```

### Markdown:
```markdown
[Get Hostinger →](https://dineshstack.com/go/hostinger)
```
# dineshstack-referral-system
