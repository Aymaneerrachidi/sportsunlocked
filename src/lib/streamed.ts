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
