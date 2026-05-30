# SportUnlocked - IPTV Sports Streaming Platform

A full-stack sports streaming platform with IPTV/HLS support, ad monetization, and Stripe subscriptions.

## Stack

- **Next.js 16** (App Router) + **Tailwind CSS 4**
- **Prisma 7** + **SQLite** (better-sqlite3 adapter)
- **HLS.js** for M3U8/IPTV stream playback
- **NextAuth.js** (credentials + Google OAuth)
- **Stripe** subscriptions

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Run database migration
npx prisma migrate dev --name init

# 4. Seed with 10 sample matches (uses Mux public test stream)
npx tsx prisma/seed.ts

# 5. Start dev server
npm run dev
```

Open http://localhost:3000.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | Base URL, e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key (optional) |

---

## Adding Stream Sources

### Via Admin Dashboard

1. Create an admin account — register normally, then promote via CLI:
   ```bash
   node -e "
   const {PrismaBetterSqlite3}=require('@prisma/adapter-better-sqlite3');
   const {PrismaClient}=require('@prisma/client');
   const p=new PrismaClient({adapter:new PrismaBetterSqlite3({url:'file:./dev.db'})});
   p.user.update({where:{email:'YOUR_EMAIL'},data:{isAdmin:true}}).then(()=>p.\$disconnect());
   "
   ```
2. Go to `/admin` after signing in.
3. Click **+ Add Match** and fill in up to 3 M3U8 stream URLs.

### Via Seed File

Edit `prisma/seed.ts` and update the stream URL fields. Run `npx tsx prisma/seed.ts` to re-seed.

---

## Ad Configuration

Ad slots use `data-ad-slot` attributes, ready for Google AdSense or a custom ad network.

| Slot | Location |
|---|---|
| Pre-roll | Fullscreen overlay before stream, skippable after 5s |
| Mid-roll | Banner overlay every 15 minutes |
| Banner | Below player |
| Sidebar | 300x250 sidebar slot |

All ads are hidden for premium users automatically. Impressions are logged to the `AdImpression` table.

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, category tabs, match grid |
| `/watch/[matchId]` | HLS player with ads, sidebar, up-next |
| `/schedule` | Weekly schedule with filters and reminders |
| `/premium` | Pricing cards and feature comparison |
| `/login` | Email + Google OAuth sign-in |
| `/register` | Account creation |
| `/admin` | Admin dashboard (admin role required) |

---

## CORS Proxy

All M3U8 requests go through `/api/proxy?url=<encoded-url>`, which:
- Fetches the manifest server-side (bypassing CORS)
- Rewrites all segment/chunklist URLs to also go through the proxy
- Sets correct `Content-Type` and `Access-Control-Allow-Origin` headers
