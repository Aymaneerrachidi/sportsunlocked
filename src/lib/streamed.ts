const BASE = "https://streamed.pk";

export interface StreamedMatch {
  id: string;
  title: string;
  category: string;
  date: number; // Unix ms
  poster?: string;
  popular: boolean;
  teams?: {
    home?: { name: string; badge?: string };
    away?: { name: string; badge?: string };
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
  const path = poster.startsWith("/") ? poster : `/api/images/proxy/${poster}`;
  return `${BASE}${path}${path.endsWith(".webp") ? "" : ".webp"}`;
}

export function matchPosterUrl(match: StreamedMatch): string | undefined {
  if (match.poster) return posterUrl(match.poster);

  const homeBadge = match.teams?.home?.badge;
  const awayBadge = match.teams?.away?.badge;
  if (homeBadge && awayBadge) {
    return `${BASE}/api/images/poster/${homeBadge}/${awayBadge}.webp`;
  }

  return undefined;
}

export function matchThumbnailUrl(match: StreamedMatch): string {
  const params = new URLSearchParams();
  params.set("v", "2");
  if (match.poster) params.set("poster", match.poster);
  if (match.teams?.home?.badge) params.set("home", match.teams.home.badge);
  if (match.teams?.away?.badge) params.set("away", match.teams.away.badge);
  if (match.teams?.home?.name) params.set("homeName", match.teams.home.name);
  if (match.teams?.away?.name) params.set("awayName", match.teams.away.name);
  params.set("sport", match.category);
  params.set("title", match.title);
  return `/api/thumbnail?${params.toString()}`;
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

const STREAM_SOURCE_PRIORITY: Record<string, number> = {
  alpha: 0,
  bravo: 1,
  charlie: 2,
  delta: 3,
  echo: 4,
};

export function streamSourceRank(source: string): number {
  return STREAM_SOURCE_PRIORITY[source.toLowerCase()] ?? 50;
}

async function streamedFetch<T>(path: string, revalidate: number | false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Streamed API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchLiveMatches(): Promise<StreamedMatch[]> {
  return streamedFetch<StreamedMatch[]>("/api/matches/live", false);
}

export function fetchTodayMatches(): Promise<StreamedMatch[]> {
  return streamedFetch<StreamedMatch[]>("/api/matches/all-today", 120);
}

export function fetchAllMatches(): Promise<StreamedMatch[]> {
  return streamedFetch<StreamedMatch[]>("/api/matches/all", 120);
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
