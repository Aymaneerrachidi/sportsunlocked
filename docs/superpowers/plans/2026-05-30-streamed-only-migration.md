# Streamed-Only Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire multi-source sync architecture with a single Streamed.pk API integration — no DB, no auth, no cron jobs.

**Architecture:** Three Next.js proxy routes forward requests to `streamed.pk`. The home page server-renders live + today matches. The watch page reads the match ID and encoded sources from the URL, fetches stream embed URLs from Streamed on demand.

**Tech Stack:** Next.js 16 App Router, TypeScript, Streamed.pk API (`/api/matches/*`, `/api/stream/*/*`, `/api/sports`)

---

## File Map

### DELETE (entire directories)
- `src/app/api/admin/`
- `src/app/api/cron/`
- `src/app/api/auth/`
- `src/app/api/webhook/`
- `src/app/api/favourites/`
- `src/app/api/history/`
- `src/app/api/checkout/`
- `src/app/api/stream-health/`
- `src/app/api/events/`
- `src/app/api/matches/`
- `src/app/api/live/`
- `src/app/api/proxy/`
- `src/app/api/ads/`
- `src/app/admin/`
- `src/app/login/`
- `src/app/register/`
- `src/app/premium/`
- `prisma/`
- `scripts/`

### DELETE (individual files)
- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `src/lib/sportsdb.ts`
- `src/lib/espnApi.ts`
- `src/lib/daddyLive.ts`
- `src/lib/sportSRC.ts`
- `src/lib/streamedSports.ts`
- `src/lib/streamedTennis.ts`
- `src/lib/streamAvailability.ts`
- `src/lib/liveStatus.ts`
- `src/lib/streamFallbacks.ts`
- `src/app/watch/[matchId]/WatchClient.tsx`
- `prisma.config.ts`
- `dev.db`

### CREATE
- `src/lib/streamed.ts` — typed Streamed API client (all fetch calls)
- `src/app/api/matches/[...slug]/route.ts` — proxy for `/api/matches/*`
- `src/app/api/stream/[source]/[id]/route.ts` — proxy for `/api/stream/{source}/{id}`
- `src/app/api/sports/route.ts` — proxy for `/api/sports`

### REWRITE
- `src/lib/sportTheme.ts` — add lowercase category name support for Streamed
- `src/components/Navbar.tsx` — remove next-auth, keep nav links
- `src/app/layout.tsx` — remove Providers wrapper
- `src/components/MatchCard.tsx` — rewrite for `StreamedMatch` shape
- `src/components/LiveNow.tsx` — rewrite, client fetches `/api/matches/live`
- `src/app/page.tsx` — server-renders today's matches
- `src/app/watch/[matchId]/page.tsx` — client component, fetches streams on mount
- `src/app/schedule/page.tsx` — server-renders today grouped by category
- `package.json` — remove dead deps

---

## Task 1: Delete dead code

**Files:** All listed in DELETE section above

- [ ] **Step 1: Delete API route directories**

```bash
Remove-Item -Recurse -Force src/app/api/admin
Remove-Item -Recurse -Force src/app/api/cron
Remove-Item -Recurse -Force src/app/api/auth
Remove-Item -Recurse -Force src/app/api/webhook
Remove-Item -Recurse -Force src/app/api/favourites
Remove-Item -Recurse -Force src/app/api/history
Remove-Item -Recurse -Force src/app/api/checkout
Remove-Item -Recurse -Force "src/app/api/stream-health"
Remove-Item -Recurse -Force src/app/api/events
Remove-Item -Recurse -Force src/app/api/matches
Remove-Item -Recurse -Force src/app/api/live
Remove-Item -Recurse -Force src/app/api/proxy
Remove-Item -Recurse -Force src/app/api/ads
```

- [ ] **Step 2: Delete page directories**

```bash
Remove-Item -Recurse -Force src/app/admin
Remove-Item -Recurse -Force src/app/login
Remove-Item -Recurse -Force src/app/register
Remove-Item -Recurse -Force src/app/premium
Remove-Item -Recurse -Force prisma
Remove-Item -Recurse -Force scripts
```

- [ ] **Step 3: Delete individual files**

```bash
Remove-Item -Force src/lib/prisma.ts
Remove-Item -Force src/lib/auth.ts
Remove-Item -Force src/lib/sportsdb.ts
Remove-Item -Force src/lib/espnApi.ts
Remove-Item -Force src/lib/daddyLive.ts
Remove-Item -Force src/lib/sportSRC.ts
Remove-Item -Force src/lib/streamedSports.ts
Remove-Item -Force src/lib/streamedTennis.ts
Remove-Item -Force src/lib/streamAvailability.ts
Remove-Item -Force src/lib/liveStatus.ts
Remove-Item -Force src/lib/streamFallbacks.ts
Remove-Item -Force prisma.config.ts
Remove-Item -Force dev.db
```

- [ ] **Step 4: Delete old watch client**

```bash
Remove-Item -Force "src/app/watch/[matchId]/WatchClient.tsx"
```

- [ ] **Step 5: Remove dead packages from package.json**

Replace the `dependencies` and `devDependencies` sections and `scripts`/`prisma` fields:

```json
{
  "name": "iptv",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "hls.js": "^1.6.16",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 6: Run npm install to clean lockfile**

```bash
npm install
```

Expected: installs only the 4 remaining runtime deps. No Prisma, no next-auth, no stripe.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove DB, auth, and multi-source sync — migrating to Streamed-only"
```

---

## Task 2: Create the Streamed API client

**Files:**
- Create: `src/lib/streamed.ts`

- [ ] **Step 1: Write `src/lib/streamed.ts`**

```typescript
const BASE = "https://streamed.pk";

export interface StreamedMatch {
  id: string;
  title: string;
  category: string;
  date: number; // Unix ms
  poster?: string;
  popular: boolean;
  teams?: {
    home?: { name: string; badge: string };
    away?: { name: string; badge: string };
  };
  sources: { source: string; id: string }[];
}

export interface StreamedStream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

export interface StreamedSport {
  id: string;
  name: string;
}

export function badgeUrl(badge: string): string {
  return `${BASE}/api/images/badge/${badge}.webp`;
}

export function posterUrl(poster: string): string {
  return `${BASE}/api/images/proxy/${poster}.webp`;
}

export function encodeSources(sources: { source: string; id: string }[]): string {
  return sources.map(s => `${s.source}:${s.id}`).join(",");
}

export function decodeSources(s: string): { source: string; id: string }[] {
  if (!s) return [];
  return s.split(",").flatMap(pair => {
    const colon = pair.indexOf(":");
    if (colon === -1) return [];
    return [{ source: pair.slice(0, colon), id: pair.slice(colon + 1) }];
  });
}

async function streamedFetch<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Streamed API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchLiveMatches(): Promise<StreamedMatch[]> {
  return streamedFetch<StreamedMatch[]>("/api/matches/live", 30);
}

export function fetchTodayMatches(): Promise<StreamedMatch[]> {
  return streamedFetch<StreamedMatch[]>("/api/matches/all-today", 120);
}

export function fetchMatchesBySport(sport: string): Promise<StreamedMatch[]> {
  return streamedFetch<StreamedMatch[]>(`/api/matches/${sport}`, 120);
}

export function fetchStreams(source: string, id: string): Promise<StreamedStream[]> {
  return streamedFetch<StreamedStream[]>(`/api/stream/${source}/${id}`, 60);
}

export function fetchSports(): Promise<StreamedSport[]> {
  return streamedFetch<StreamedSport[]>("/api/sports", 3600);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/streamed.ts
git commit -m "feat: add Streamed API client with typed interfaces"
```

---

## Task 3: Create proxy API routes

**Files:**
- Create: `src/app/api/matches/[...slug]/route.ts`
- Create: `src/app/api/stream/[source]/[id]/route.ts`
- Create: `src/app/api/sports/route.ts`

- [ ] **Step 1: Create matches proxy — `src/app/api/matches/[...slug]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");
  const revalidate = path === "live" ? 30 : 120;

  try {
    const res = await fetch(`https://streamed.pk/api/matches/${path}`, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=60` },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
```

- [ ] **Step 2: Create stream proxy — `src/app/api/stream/[source]/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ source: string; id: string }> }
) {
  const { source, id } = await params;

  try {
    const res = await fetch(`https://streamed.pk/api/stream/${source}/${id}`, {
      next: { revalidate: 60 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
```

- [ ] **Step 3: Create sports proxy — `src/app/api/sports/route.ts`**

```typescript
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch("https://streamed.pk/api/sports", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/matches src/app/api/stream src/app/api/sports
git commit -m "feat: add Streamed proxy API routes (matches, stream, sports)"
```

---

## Task 4: Update sportTheme and layout

**Files:**
- Modify: `src/lib/sportTheme.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Update `src/lib/sportTheme.ts` to handle Streamed's lowercase category names**

```typescript
export const SPORT_COLORS: Record<string, string> = {
  // Streamed API lowercase categories
  football:         "var(--sport-football)",
  soccer:           "var(--sport-football)",
  basketball:       "var(--sport-basketball)",
  tennis:           "var(--sport-tennis)",
  hockey:           "var(--sport-hockey)",
  boxing:           "var(--sport-boxing)",
  mma:              "var(--sport-boxing)",
  fight:            "var(--sport-boxing)",
  cricket:          "var(--sport-cricket)",
  rugby:            "var(--sport-rugby)",
  baseball:         "var(--sport-baseball)",
  golf:             "#22c55e",
  motorsports:      "#F59E0B",
  amfootball:       "#F97316",
  darts:            "#a78bfa",
  afl:              "#F59E0B",
  other:            "var(--sport-other)",
};

export function sportColor(category: string): string {
  return SPORT_COLORS[category.toLowerCase()] ?? "var(--sport-other)";
}
```

- [ ] **Step 2: Rewrite `src/components/Navbar.tsx` — remove next-auth, keep nav + style**

```typescript
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

const NAV_LINKS = [
  { href: "/", label: "Live" },
  { href: "/schedule", label: "Schedule" },
  { href: "/multiview", label: "Multi-View" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "rgba(6,10,18,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}>
        <div style={{ flexShrink: 0 }}>
          <BrandLogo size="sm" collapseOnMobile />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "var(--accent)" : "var(--text-muted)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                position: "relative",
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >
                {label}
                {active && (
                  <span style={{
                    position: "absolute", bottom: -1, left: 12, right: 12,
                    height: 2, background: "var(--accent)", borderRadius: 1,
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/layout.tsx` — remove Providers wrapper**

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SportUnlocked - Watch Live Sports",
  description: "Unlock live sports streams from around the world. Football, Basketball, Tennis, F1 and more.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SportUnlocked" },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "1024x1024" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main className="flex-1" style={{ position: "relative", zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Delete `src/components/Providers.tsx`**

```bash
Remove-Item -Force src/components/Providers.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sportTheme.ts src/components/Navbar.tsx src/app/layout.tsx
git commit -m "feat: remove auth from layout and navbar, update sport colors for Streamed categories"
```

---

## Task 5: Rewrite MatchCard component

**Files:**
- Modify: `src/components/MatchCard.tsx`

- [ ] **Step 1: Rewrite `src/components/MatchCard.tsx`**

```typescript
"use client";
import Link from "next/link";
import { StreamedMatch, badgeUrl, encodeSources } from "@/lib/streamed";
import SportIcon from "@/components/SportIcon";
import { sportColor } from "@/lib/sportTheme";

interface MatchCardProps {
  match: StreamedMatch;
  isLive?: boolean;
}

export default function MatchCard({ match, isLive = false }: MatchCardProps) {
  const color = sportColor(match.category);
  const teamA = match.teams?.home?.name ?? match.title.split(" vs ")[0] ?? match.title;
  const teamB = match.teams?.away?.name ?? match.title.split(" vs ")[1] ?? "";
  const badgeA = match.teams?.home?.badge;
  const badgeB = match.teams?.away?.badge;
  const time = new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const href = `/watch/${match.id}?s=${encodeSources(match.sources)}`;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--card)",
          border: `1px solid ${isLive ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          transition: "border-color 0.2s, transform 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = color;
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = isLive ? "rgba(239,68,68,0.4)" : "var(--border)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <div style={{ height: 2, background: isLive ? "var(--live)" : color }} />

        <div style={{
          height: 80, background: "var(--surface)", position: "relative",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
        }}>
          {badgeA && <img src={badgeUrl(badgeA)} alt={teamA} width={40} height={40} style={{ objectFit: "contain" }} />}
          {badgeB && <img src={badgeUrl(badgeB)} alt={teamB} width={40} height={40} style={{ objectFit: "contain" }} />}
          {!badgeA && !badgeB && (
            <SportIcon sport={match.category} size={32} color={color} muted />
          )}

          <div style={{ position: "absolute", top: 6, left: 8, background: "rgba(6,10,18,0.72)", border: `1px solid ${color}55`, borderRadius: "var(--radius-sm)", padding: 4 }}>
            <SportIcon sport={match.category} size={14} color={color} />
          </div>

          {isLive ? (
            <div style={{ position: "absolute", top: 6, right: 8, display: "flex", alignItems: "center", gap: 4, background: "var(--live)", borderRadius: 3, padding: "2px 7px" }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 9, letterSpacing: "0.1em", color: "#fff" }}>LIVE</span>
            </div>
          ) : (
            <div style={{ position: "absolute", top: 6, right: 8, background: "rgba(6,10,18,0.8)", border: "1px solid var(--border)", borderRadius: 3, padding: "2px 7px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, color: "var(--text-muted)" }}>{time}</span>
            </div>
          )}
        </div>

        <div style={{ padding: "8px 10px 10px" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {match.category}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamA}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 9, color: "var(--text-dim)", flexShrink: 0 }}>VS</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{teamB}</span>
          </div>
          {match.sources.length > 0 && (
            <p style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
              {match.sources.length} source{match.sources.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MatchCard.tsx
git commit -m "feat: rewrite MatchCard for Streamed API data shape"
```

---

## Task 6: Rewrite LiveNow component

**Files:**
- Modify: `src/components/LiveNow.tsx`

- [ ] **Step 1: Rewrite `src/components/LiveNow.tsx`**

```typescript
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StreamedMatch, badgeUrl, encodeSources } from "@/lib/streamed";
import SportIcon from "@/components/SportIcon";
import { sportColor } from "@/lib/sportTheme";

export default function LiveNow() {
  const [events, setEvents] = useState<StreamedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/live?t=${Date.now()}`);
      const data: StreamedMatch[] = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch { /* keep old data */ }
    setLoading(false);
    setCountdown(30);
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 30_000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [events]);

  if (!loading && events.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: "var(--live)", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
            Live Now
          </h2>
          {events.length > 0 && (
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, background: "var(--live-dim)", color: "var(--live)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "2px 8px" }}>
              {events.length} LIVE
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-display)" }}>
            Refreshes in {countdown}s
          </span>
          <button onClick={fetchLive} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 10px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", cursor: "pointer" }}>
            {loading ? "Loading" : "Refresh"}
          </button>
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ width: 260, flexShrink: 0, height: 120, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {events.map(event => {
            const color = sportColor(event.category);
            const teamA = event.teams?.home?.name ?? event.title.split(" vs ")[0] ?? event.title;
            const teamB = event.teams?.away?.name ?? event.title.split(" vs ")[1] ?? "";
            const badgeA = event.teams?.home?.badge;
            const badgeB = event.teams?.away?.badge;
            const href = `/watch/${event.id}?s=${encodeSources(event.sources)}`;

            return (
              <Link key={event.id} href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div
                  style={{ width: 260, background: "var(--card)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "var(--radius-lg)", overflow: "hidden", transition: "border-color 0.2s, transform 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ height: 2, background: "var(--live)" }} />
                  <div style={{ height: 70, background: "var(--surface)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    {badgeA && <img src={badgeUrl(badgeA)} alt={teamA} width={36} height={36} style={{ objectFit: "contain" }} />}
                    {badgeB && <img src={badgeUrl(badgeB)} alt={teamB} width={36} height={36} style={{ objectFit: "contain" }} />}
                    {!badgeA && !badgeB && <SportIcon sport={event.category} size={28} color={color} muted />}
                    <div style={{ position: "absolute", top: 6, left: 8, background: "rgba(6,10,18,0.72)", border: `1px solid ${color}55`, borderRadius: "var(--radius-sm)", padding: 4 }}>
                      <SportIcon sport={event.category} size={14} color={color} />
                    </div>
                    <div style={{ position: "absolute", top: 6, right: 8, display: "flex", alignItems: "center", gap: 4, background: "var(--live)", borderRadius: 3, padding: "2px 7px" }}>
                      <span className="live-dot" style={{ width: 5, height: 5 }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 9, letterSpacing: "0.1em", color: "#fff" }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: 4 }}>{event.category}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamA}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 9, color: "var(--text-dim)", flexShrink: 0 }}>VS</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{teamB}</span>
                    </div>
                    {event.sources.length > 1 && (
                      <p style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>{event.sources.length} sources</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LiveNow.tsx
git commit -m "feat: rewrite LiveNow — client fetches /api/matches/live directly, no DB matching"
```

---

## Task 7: Rewrite home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

```typescript
import LiveNow from "@/components/LiveNow";
import MatchCard from "@/components/MatchCard";
import HomeTabs from "@/components/HomeTabs";
import { fetchTodayMatches, fetchMatchesBySport, StreamedMatch } from "@/lib/streamed";

export const dynamic = "force-dynamic";

const SPORTS = ["All", "Football", "Basketball", "Tennis", "Hockey", "Boxing", "Cricket", "Rugby", "Motor Sports", "Golf", "Darts"];

const SPORT_SLUG: Record<string, string> = {
  Football: "football",
  Basketball: "basketball",
  Tennis: "tennis",
  Hockey: "hockey",
  Boxing: "boxing",
  Cricket: "cricket",
  Rugby: "rugby",
  "Motor Sports": "motorsports",
  Golf: "golf",
  Darts: "darts",
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sp = await searchParams;
  const sport = sp.sport ?? "All";

  let matches: StreamedMatch[] = [];
  try {
    if (sport === "All") {
      matches = await fetchTodayMatches();
    } else {
      const slug = SPORT_SLUG[sport] ?? sport.toLowerCase();
      matches = await fetchMatchesBySport(slug);
    }
  } catch {
    // LiveNow still renders client-side; grid shows empty state
  }

  // Popular matches first, then by date ascending
  matches.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.date - b.date;
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 60px" }}>
      <LiveNow />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 3, height: 20, background: "var(--accent)", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
            {sport === "All" ? "Today" : sport}
          </h2>
        </div>
        <HomeTabs sports={SPORTS} active={sport} />
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          No matches found
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {matches.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite home page — server renders today's matches from Streamed API"
```

---

## Task 8: Rewrite watch page

**Files:**
- Modify: `src/app/watch/[matchId]/page.tsx`

The watch page is a client component. It reads the encoded sources from `?s=` URL param, fetches stream embed URLs for each source in parallel via our proxy, and renders an iframe player with a stream selector.

- [ ] **Step 1: Rewrite `src/app/watch/[matchId]/page.tsx`**

```typescript
"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { decodeSources, StreamedStream } from "@/lib/streamed";

interface LoadedStream extends StreamedStream {
  sourceName: string;
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.matchId as string;
  const sources = decodeSources(searchParams.get("s") ?? "");

  const [streams, setStreams] = useState<LoadedStream[]>([]);
  const [active, setActive] = useState<LoadedStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStreams = useCallback(async () => {
    if (sources.length === 0) {
      setError("No stream sources for this match.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const results: LoadedStream[] = [];
    await Promise.allSettled(
      sources.map(async ({ source, id }) => {
        try {
          const res = await fetch(`/api/stream/${source}/${id}`);
          if (!res.ok) return;
          const data: StreamedStream[] = await res.json();
          results.push(...data.map(s => ({ ...s, sourceName: source })));
        } catch { /* skip failed source */ }
      })
    );

    if (results.length === 0) {
      setError("No streams available right now. Try again in a moment.");
      setLoading(false);
      return;
    }

    // HD first, then by streamNo
    results.sort((a, b) => {
      if (a.hd && !b.hd) return -1;
      if (!a.hd && b.hd) return 1;
      return a.streamNo - b.streamNo;
    });

    setStreams(results);
    setActive(results[0]);
    setLoading(false);
  }, [matchId, searchParams.get("s")]);

  useEffect(() => { loadStreams(); }, [loadStreams]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
      {/* Player */}
      <div style={{
        position: "relative", width: "100%", paddingBottom: "56.25%",
        background: "#000", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 16,
      }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Loading stream…
            </span>
          </div>
        )}
        {!loading && error && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--live)", letterSpacing: "0.06em" }}>{error}</span>
            <button onClick={loadStreams} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--accent)", color: "#060A12", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 20px", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}
        {active && (
          <iframe
            key={active.id}
            src={active.embedUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
          />
        )}
      </div>

      {/* Stream selector */}
      {streams.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {streams.map(stream => (
            <button
              key={stream.id}
              onClick={() => setActive(stream)}
              style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "6px 14px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: active?.id === stream.id ? "var(--accent)" : "var(--surface)",
                color: active?.id === stream.id ? "#060A12" : "var(--text-muted)",
                cursor: "pointer", transition: "background 0.15s, color 0.15s",
              }}
            >
              {stream.sourceName} {stream.streamNo} · {stream.hd ? "HD" : "SD"}{stream.language !== "English" ? ` · ${stream.language}` : ""}
            </button>
          ))}
        </div>
      )}

      {/* Back link */}
      <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", textDecoration: "none" }}>
        ← Back to matches
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/watch/[matchId]/page.tsx"
git commit -m "feat: rewrite watch page — client fetches Streamed stream URLs on demand, no DB"
```

---

## Task 9: Rewrite schedule page

**Files:**
- Modify: `src/app/schedule/page.tsx`

- [ ] **Step 1: Rewrite `src/app/schedule/page.tsx`**

```typescript
import { fetchTodayMatches, StreamedMatch } from "@/lib/streamed";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let matches: StreamedMatch[] = [];
  try {
    matches = await fetchTodayMatches();
  } catch {
    // show empty state
  }

  // Group by category, sort within group by date
  const grouped: Record<string, StreamedMatch[]> = {};
  for (const m of matches) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }
  for (const arr of Object.values(grouped)) {
    arr.sort((a, b) => a.date - b.date);
  }

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 3, height: 24, background: "var(--accent)", borderRadius: 2 }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
          Schedule
        </h1>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-dim)" }}>
          {today}
        </span>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          No matches scheduled today
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {Object.entries(grouped).map(([category, categoryMatches]) => (
            <div key={category}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  {category}
                </h2>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-dim)" }}>
                  {categoryMatches.length} match{categoryMatches.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {categoryMatches.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/schedule/page.tsx
git commit -m "feat: rewrite schedule page — server renders today's matches grouped by sport"
```

---

## Task 10: Build and verify

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected: clean TypeScript compile, no errors. All routes listed in build output:
- `ƒ /` (dynamic)
- `ƒ /watch/[matchId]` (dynamic)
- `ƒ /schedule` (dynamic)
- `ƒ /api/matches/[...slug]` (dynamic)
- `ƒ /api/stream/[source]/[id]` (dynamic)
- `ƒ /api/sports` (static with revalidate)

If TypeScript errors appear, fix them before proceeding.

- [ ] **Step 2: Start production server**

```bash
npm start
```

Expected: `✓ Ready in ~300ms`

- [ ] **Step 3: Verify home page loads live events**

Open `http://localhost:3000`. Confirm:
- Live Now strip shows live matches with team badges
- Today's match grid renders below
- Sport tabs filter the grid

- [ ] **Step 4: Verify watch page loads streams**

Click any match card. Confirm:
- URL is `/watch/[streamed-match-id]?s=source:id,...`
- Player iframe loads within a few seconds
- Stream selector buttons appear if multiple sources

- [ ] **Step 5: Verify schedule page**

Open `http://localhost:3000/schedule`. Confirm:
- Today's matches grouped by sport category
- Times displayed correctly

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete migration to Streamed-only architecture"
```
