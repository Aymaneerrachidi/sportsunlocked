"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StreamedMatch, badgeUrl, encodeSources, matchThumbnailUrl } from "@/lib/streamed";
import SportIcon from "@/components/SportIcon";
import { sportColor } from "@/lib/sportTheme";

const LIVE_POLL_MS = 15_000;
const LIVE_PRE_ROLL_MS = 2 * 60_000;
const LIVE_FALLBACK_WINDOW_MS = 4 * 60 * 60_000;

function mergeLiveWithDueFixtures(live: StreamedMatch[], today: StreamedMatch[]) {
  const now = Date.now();
  const seen = new Set(live.map(match => match.id));
  const dueFixtures = today.filter(match => {
    if (seen.has(match.id) || match.sources.length === 0) return false;
    return match.date <= now + LIVE_PRE_ROLL_MS && match.date >= now - LIVE_FALLBACK_WINDOW_MS;
  });

  return [...live, ...dueFixtures].sort((a, b) => a.date - b.date);
}

export default function LiveNow() {
  const [events, setEvents] = useState<StreamedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(LIVE_POLL_MS / 1000);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const [liveResult, todayResult] = await Promise.allSettled([
        fetch(`/api/matches/live?t=${Date.now()}`, { cache: "no-store" }).then(res => res.json() as Promise<StreamedMatch[]>),
        fetch(`/api/matches/all-today?t=${Date.now()}`, { cache: "no-store" }).then(res => res.json() as Promise<StreamedMatch[]>),
      ]);
      const live = liveResult.status === "fulfilled" && Array.isArray(liveResult.value) ? liveResult.value : [];
      const today = todayResult.status === "fulfilled" && Array.isArray(todayResult.value) ? todayResult.value : [];
      setEvents(mergeLiveWithDueFixtures(live, today));
    } catch { /* keep old data */ }
    setLoading(false);
    setCountdown(LIVE_POLL_MS / 1000);
  }, []);

  useEffect(() => {
    const initial = setTimeout(fetchLive, 0);
    const interval = setInterval(fetchLive, LIVE_POLL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
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
            const thumbnail = matchThumbnailUrl(event);
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
                    <img
                      src={thumbnail}
                      alt=""
                      loading="lazy"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.42 }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,10,18,0.82), rgba(6,10,18,0.32), rgba(6,10,18,0.82))" }} />
                    {badgeA && <img src={badgeUrl(badgeA)} alt={teamA} width={36} height={36} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} />}
                    {badgeB && <img src={badgeUrl(badgeB)} alt={teamB} width={36} height={36} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} />}
                    {!badgeA && !badgeB && <div style={{ position: "relative", zIndex: 1 }}><SportIcon sport={event.category} size={28} color={color} muted /></div>}
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
