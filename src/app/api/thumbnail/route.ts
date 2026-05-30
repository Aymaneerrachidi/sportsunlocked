import { NextRequest } from "next/server";

const BASE = "https://streamed.pk";
const SPORTS_DB_KEY = process.env.THESPORTSDB_API_KEY?.trim() ?? "";
const HAS_SPORTS_DB_SEARCH_KEY = SPORTS_DB_KEY.length > 0 && SPORTS_DB_KEY !== "123";

interface SportsDbTeam {
  strBadge?: string | null;
  strLogo?: string | null;
  strFanart1?: string | null;
  strFanart2?: string | null;
  strFanart3?: string | null;
  strFanart4?: string | null;
  strBanner?: string | null;
}

interface SportsDbEvent {
  strThumb?: string | null;
  strPoster?: string | null;
  strSquare?: string | null;
  strFanart?: string | null;
  strBanner?: string | null;
}

interface SportsDbPlayer {
  strThumb?: string | null;
  strCutout?: string | null;
  strRender?: string | null;
  strFanart1?: string | null;
  strFanart2?: string | null;
  strFanart3?: string | null;
  strFanart4?: string | null;
}

interface SportsDbSport {
  strSport?: string | null;
  strFormat?: string | null;
  strSportThumb?: string | null;
  strSportIconGreen?: string | null;
}

function streamedImageCandidates(req: NextRequest) {
  const poster = req.nextUrl.searchParams.get("poster");
  const home = req.nextUrl.searchParams.get("home");
  const away = req.nextUrl.searchParams.get("away");
  const candidates: string[] = [];

  if (poster) {
    const path = poster.startsWith("/") ? poster : `/api/images/proxy/${poster}`;
    candidates.push(`${BASE}${path}${path.endsWith(".webp") ? "" : ".webp"}`);
  }
  if (home && away) candidates.push(`${BASE}/api/images/poster/${home}/${away}.webp`);
  if (home) candidates.push(`${BASE}/api/images/badge/${home}.webp`);
  if (away) candidates.push(`${BASE}/api/images/badge/${away}.webp`);

  return candidates;
}

function imagePreview(url: string) {
  if (url.includes("thesportsdb.com") || url.includes("r2.thesportsdb.com")) {
    return url.endsWith(".png") ? `${url}/small` : `${url}/medium`;
  }
  return url;
}

async function sportsDbImageCandidates(teamName: string) {
  if (!HAS_SPORTS_DB_SEARCH_KEY) return [];

  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/searchteams.php?t=${encodeURIComponent(teamName)}`,
    {
      next: { revalidate: 7 * 24 * 60 * 60 },
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );

  if (!res.ok) return [];

  const data = await res.json() as { teams?: SportsDbTeam[] | null };
  const team = data.teams?.[0];
  if (!team) return [];

  return [
    team.strFanart1,
    team.strFanart2,
    team.strFanart3,
    team.strFanart4,
    team.strBanner,
    team.strBadge,
    team.strLogo,
  ].filter(Boolean).map(url => imagePreview(url as string));
}

function eventSearchTerm(title: string) {
  return title
    .replace(/\s+(vs\.?|v\.?|@)\s+/gi, "_vs_")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function playerSearchNames(title: string) {
  const cleaned = title.replace(/\([^)]*\)/g, " ");
  return cleaned
    .split(/\s+(?:vs\.?|v\.?|@)\s+|[-:|,]/i)
    .map(part => part.trim())
    .filter(part => part.length >= 3 && part.length <= 40)
    .slice(0, 4);
}

async function sportsDbEventImageCandidates(title: string) {
  if (!HAS_SPORTS_DB_SEARCH_KEY) return [];

  const term = eventSearchTerm(title);
  if (!term) return [];

  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/searchevents.php?e=${encodeURIComponent(term)}`,
    {
      next: { revalidate: 7 * 24 * 60 * 60 },
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );

  if (!res.ok) return [];

  const data = await res.json() as { event?: SportsDbEvent[] | null };
  const event = data.event?.[0];
  if (!event) return [];

  return [
    event.strThumb,
    event.strPoster,
    event.strSquare,
    event.strFanart,
    event.strBanner,
  ].filter(Boolean).map(url => imagePreview(url as string));
}

async function sportsDbPlayerImageCandidates(playerName: string) {
  if (!HAS_SPORTS_DB_SEARCH_KEY) return [];

  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/searchplayers.php?p=${encodeURIComponent(playerName)}`,
    {
      next: { revalidate: 7 * 24 * 60 * 60 },
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );

  if (!res.ok) return [];

  const data = await res.json() as { player?: SportsDbPlayer[] | null };
  const player = data.player?.[0];
  if (!player) return [];

  return [
    player.strFanart1,
    player.strFanart2,
    player.strFanart3,
    player.strFanart4,
    player.strRender,
    player.strCutout,
    player.strThumb,
  ].filter(Boolean).map(url => imagePreview(url as string));
}

async function sportsDbSportImageCandidates(sportName: string) {
  const directSportCandidates = sportsDbSportSlugs(sportName).map(slug => (
    `https://www.thesportsdb.com/images/sports/${slug}.jpg`
  ));

  if (!HAS_SPORTS_DB_SEARCH_KEY) return directSportCandidates;

  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/all_sports.php`,
    {
      next: { revalidate: 30 * 24 * 60 * 60 },
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );

  if (!res.ok) return directSportCandidates;

  const data = await res.json() as { sports?: SportsDbSport[] | null };
  const aliases = sportsDbSportSlugs(sportName).map(slug => slug.replace(/[^a-z0-9]/g, ""));
  const sport = data.sports?.find(item => {
    const name = item.strSport?.toLowerCase().replace(/[^a-z0-9]/g, "");
    return aliases.some(alias => name === alias || name?.includes(alias) || alias.includes(name ?? ""));
  });
  if (!sport) return directSportCandidates;

  return [
    sport.strSportThumb,
    sport.strSportIconGreen,
    ...directSportCandidates,
  ].filter(Boolean).map(url => imagePreview(url as string));
}

function sportsDbSportSlugs(sportName: string) {
  const normalized = sportName.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, string[]> = {
    afl: ["aussie_rules"],
    american_football: ["american_football"],
    basketball: ["basketball"],
    boxing: ["fighting"],
    cricket: ["cricket"],
    darts: ["darts"],
    football: ["soccer"],
    f1: ["motorsport"],
    formula_1: ["motorsport"],
    golf: ["golf"],
    hockey: ["ice_hockey"],
    ice_hockey: ["ice_hockey"],
    motor_sports: ["motorsport"],
    motorsports: ["motorsport"],
    rugby: ["rugby"],
    tennis: ["tennis"],
  };

  return [...new Set([...(aliases[normalized] ?? []), normalized])];
}

async function externalImageCandidates(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "";
  const sport = req.nextUrl.searchParams.get("sport") ?? "";
  const names = [
    req.nextUrl.searchParams.get("homeName"),
    req.nextUrl.searchParams.get("awayName"),
  ].filter(Boolean) as string[];

  const candidates: string[] = [];

  if (title) {
    try {
      candidates.push(...await sportsDbEventImageCandidates(title));
    } catch {
      // try the next source
    }
  }

  for (const name of names) {
    try {
      candidates.push(...await sportsDbImageCandidates(name));
    } catch {
      // try the next team name or source
    }
  }

  if (names.length === 0 && title) {
    for (const name of playerSearchNames(title)) {
      try {
        candidates.push(...await sportsDbPlayerImageCandidates(name));
      } catch {
        // try the next player-ish title segment
      }
    }
  }

  if (sport) {
    try {
      candidates.push(...await sportsDbSportImageCandidates(sport));
    } catch {
      // keep the generated fallback available
    }
  }

  return candidates;
}

function svgFallback(title: string, sport: string) {
  const safeTitle = title.replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c));
  const safeSport = sport.replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#07111f"/>
      <stop offset="0.55" stop-color="#13283c"/>
      <stop offset="1" stop-color="#0b141f"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <rect x="28" y="28" width="584" height="304" rx="18" fill="none" stroke="#2dd4bf" stroke-opacity=".35" stroke-width="2"/>
  <text x="320" y="150" text-anchor="middle" fill="#2dd4bf" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="4">${safeSport.toUpperCase()}</text>
  <text x="320" y="205" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-size="30" font-weight="800">${safeTitle.slice(0, 34)}</text>
</svg>`;
}

export async function GET(req: NextRequest) {
  const candidates = [
    ...streamedImageCandidates(req),
    ...await externalImageCandidates(req),
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!res.ok || !res.body) continue;

      return new Response(res.body, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Content-Type": res.headers.get("Content-Type") ?? "image/webp",
        },
      });
    } catch {
      // try the next thumbnail candidate
    }
  }

  const title = req.nextUrl.searchParams.get("title") ?? "Live Event";
  const sport = req.nextUrl.searchParams.get("sport") ?? "Sports";

  return new Response(svgFallback(title, sport), {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
