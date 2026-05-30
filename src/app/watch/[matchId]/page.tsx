import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import WatchClient from "./WatchClient";
import { fetchStreamedStreamUrls, fetchStreamedMatchByTeams } from "@/lib/streamedSports";
import { findDLHDEmbedByTeams } from "@/lib/daddyLive";
import { findSportSRCEmbedByTeams, fetchSportSRCStreamById } from "@/lib/sportSRC";
import { isEffectivelyLive } from "@/lib/liveStatus";
import { filterAvailableStreams } from "@/lib/streamAvailability";

export const dynamic = "force-dynamic";

type SessionUser = { isPremium?: boolean; isAdmin?: boolean };
type ProviderFrame = {
  url?: string;
  server?: string;
  title?: string;
  match?: string;
  court?: string;
};
type ProviderMatch = {
  tag?: string;
  slug?: string;
  kickoff?: string;
  endTime?: string;
  league?: string;
  poster?: string | null;
  iframes?: ProviderFrame[];
};

/** Last-name fallback: "Charlie Edwards" → "edwards" */
function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? name).toLowerCase();
}

function tagMatchesTeams(tag: string, aLow: string, bLow: string): boolean {
  const t = tag.toLowerCase();
  if (t.includes(aLow) && t.includes(bLow)) return true;
  const aLast = lastName(aLow);
  const bLast = lastName(bLow);
  if (aLast.length >= 4 && bLast.length >= 4 && t.includes(aLast) && t.includes(bLast)) return true;
  return false;
}

function appendUnique(
  embedUrls: string[],
  streamLabels: string[],
  newUrls: string[],
  newLabels: string[]
) {
  for (let i = 0; i < newUrls.length; i++) {
    if (newUrls[i] && !embedUrls.includes(newUrls[i])) {
      embedUrls.push(newUrls[i]);
      streamLabels.push(newLabels[i] ?? `S${embedUrls.length}`);
    }
  }
}

export default async function WatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const isPremium = user?.isPremium ?? false;
  const isAdmin = user?.isAdmin ?? false;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { channel: true },
  });
  if (!match) notFound();

  // Self-heal: if the match should be live but DB hasn't caught up, fix it now
  if (!match.isLive && match.status !== "finished") {
    const shouldBeLive = isEffectivelyLive({
      sport: match.sport,
      startTime: match.startTime,
      title: match.title,
      competition: match.competition,
    });
    if (shouldBeLive) {
      await prisma.match.update({
        where: { id: matchId },
        data: { isLive: true, status: "live" },
      });
      match.isLive = true;
      (match as typeof match & { status: string }).status = "live";
    }
  }

  const related = await prisma.match.findMany({
    where: { id: { not: matchId }, isLive: { not: false } },
    orderBy: [{ isLive: "desc" }, { startTime: "asc" }],
    take: 5,
  });

  const relatedFull = related.length >= 3 ? related : await prisma.match.findMany({
    where: { id: { not: matchId } },
    orderBy: [{ isLive: "desc" }, { startTime: "asc" }],
    take: 5,
  });

  let embedUrls: string[] = [];
  let streamLabels: string[] = [];

  // externalId format for streamed.st: streamed-{category}-{source}-{sourceId}
  // All known categories are single words — parse by splitting on "-" at index 1 and 2.
  const isStreamed = match.externalId?.startsWith("streamed-") ?? false;

  // ── Providers run in parallel ─────────────────────────────────────────────
  // 1. EmbedSportex  — primary, match-specific
  // 2. streamed.st/su — direct source/id + team-name search, all sources
  // 3. DaddyLiveHD   — schedule-based, dlhd.so
  // 4. SportSRC      — free JSON API, sportsrc.org
  const [sportexResult, streamedResult, dlhdResult, sportSRCResult] = await Promise.allSettled([
    // EmbedSportex — always search (by exact slug for sportex-*, by team names for all others)
    (async () => {
      const res = await fetch("https://api.embedsportex.site/api/streams", {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as Record<string, unknown>;
      const aLow = match.teamA.toLowerCase();
      const bLow = match.teamB.toLowerCase();
      const slug = match.externalId?.startsWith("sportex-")
        ? match.externalId.replace("sportex-", "")
        : null;
      for (const matches of Object.values(data)) {
        if (!Array.isArray(matches)) continue;
        const found = (matches as ProviderMatch[]).find((m) => {
          if (!m.iframes?.length) return false;
          if (slug) return m.slug === slug;
          const tag = m.tag ?? "";
          return tag.length > 0 && tagMatchesTeams(tag, aLow, bLow);
        });
        if (found?.iframes?.length) {
          const frames = found.iframes.filter(
            (f): f is ProviderFrame & { url: string } => Boolean(f.url)
          );
          return {
            embedUrls: frames.map((f) => f.url),
            streamLabels: frames.map(
              (f, i) => f.title || f.match || f.court || f.server || `S${i + 1}`
            ),
          };
        }
      }
      return null;
    })(),

    // streamed.st / DLHD / SportSRC — direct fetch by stored id, then team-name fallback
    (async () => {
      const exId = match.externalId ?? "";

      // DaddyLiveHD: embed URL is deterministic from channelId
      if (exId.startsWith("dlhd-")) {
        const channelId = exId.replace("dlhd-", "");
        return { embedUrls: [`https://dlhd.so/stream/stream-${channelId}.php`], streamLabels: ["DLHD"] };
      }

      // SportSRC: re-fetch streams by stored event id
      if (exId.startsWith("sportsrc-")) {
        const eventId = exId.replace("sportsrc-", "");
        const direct = await fetchSportSRCStreamById(eventId).catch(() => null);
        if (direct) return direct;
      }

      // streamed.st: try stored source/id first
      if (isStreamed) {
        const parts = exId.split("-");
        if (parts.length >= 4) {
          const source = parts[2];
          const sourceId = parts.slice(3).join("-");
          if (source && sourceId) {
            const direct = await fetchStreamedStreamUrls(source, sourceId).catch(() => null);
            if (direct) return direct;
          }
        }
      }

      // Team-name search: tries ALL sources across all sport categories
      return await fetchStreamedMatchByTeams(match.sport, match.teamA, match.teamB).catch(() => null);
    })(),

    // DaddyLiveHD — schedule-based, dlhd.so
    findDLHDEmbedByTeams(match.teamA, match.teamB)
      .then((url) => (url ? { embedUrls: [url], streamLabels: ["DLHD"] } : null))
      .catch(() => null),

    // SportSRC — free unlimited JSON API
    findSportSRCEmbedByTeams(match.teamA, match.teamB).catch(() => null),
  ]);

  // ── Merge EmbedSportex (primary for all match types) ────────────────────
  if (sportexResult.status === "fulfilled" && sportexResult.value) {
    appendUnique(embedUrls, streamLabels, sportexResult.value.embedUrls, sportexResult.value.streamLabels);
  }

  // ── Always append streamed.st as additional servers ───────────────────────
  if (streamedResult.status === "fulfilled" && streamedResult.value) {
    appendUnique(embedUrls, streamLabels, streamedResult.value.embedUrls, streamedResult.value.streamLabels);
  }

  // ── Always append DaddyLiveHD as additional server ────────────────────────
  if (dlhdResult.status === "fulfilled" && dlhdResult.value) {
    appendUnique(embedUrls, streamLabels, dlhdResult.value.embedUrls, dlhdResult.value.streamLabels);
  }

  // ── Always append SportSRC as additional server ───────────────────────────
  if (sportSRCResult.status === "fulfilled" && sportSRCResult.value) {
    appendUnique(embedUrls, streamLabels, sportSRCResult.value.embedUrls, sportSRCResult.value.streamLabels);
  }

  // ── Last resort: use cached DB embed URLs ─────────────────────────────────
  if (embedUrls.length === 0 && match.embedUrl) {
    embedUrls.push(match.embedUrl);
    streamLabels.push("Main");
  }
  if (match.stream1 && !embedUrls.includes(match.stream1)) {
    embedUrls.push(match.stream1);
    streamLabels.push("S1");
  }
  if (match.stream2 && !embedUrls.includes(match.stream2)) {
    embedUrls.push(match.stream2);
    streamLabels.push("S2");
  }
  if (match.stream3 && !embedUrls.includes(match.stream3)) {
    embedUrls.push(match.stream3);
    streamLabels.push("S3");
  }

  const availableStreams = await filterAvailableStreams({ embedUrls, streamLabels });
  embedUrls = availableStreams.embedUrls;
  streamLabels = availableStreams.streamLabels;

  return (
    <WatchClient
      match={{
        ...match,
        startTime: match.startTime.toISOString(),
        channelUrl: match.channel?.url ?? null,
        channelId: match.channelId,
        embedUrls,
        streamLabels,
        externalId: match.externalId,
      }}
      related={relatedFull.map(r => ({ ...r, startTime: r.startTime.toISOString() }))}
      isPremium={isPremium || isAdmin}
    />
  );
}
