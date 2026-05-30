"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SportIcon from "@/components/SportIcon";
import { sportColor } from "@/lib/sportTheme";

const SPORT_COLORS: Record<string, string> = {
  Football: "#10B981", Basketball: "#F97316", Tennis: "#A78BFA",
  F1: "#EF4444", Cricket: "#0EA5E9", Rugby: "#F59E0B",
  Baseball: "#06B6D4", Boxing: "#EC4899", Other: "#94A3B8",
  MotoSports: "#F59E0B", Motorcycle: "#F59E0B",
};

interface LiveEvent {
  slug: string;
  title: string;
  teamA: string;
  teamB: string;
  sport: string;
  league: string;
  kickoff: string;
  poster: string | null;
  embedUrls: string[];
  streamLabels?: string[];
  isLive: boolean;
  dbId: string | null;
  sourceSlug?: string;
}

interface LiveNowProps {
  dbMatches: { id: string; externalId: string | null }[];
}

export default function LiveNow({ dbMatches }: LiveNowProps) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/live?t=${Date.now()}`);
      const data = await res.json();

      const slugToId: Record<string, string> = {};
      for (const m of dbMatches) {
        if (m.externalId) {
          slugToId[m.externalId] = m.id;
        }
        if (m.externalId?.startsWith("sportex-")) {
          const slug = m.externalId.replace("sportex-", "");
          slugToId[slug] = m.id;
        }
      }

      const mapped = data.events.map((e: LiveEvent) => ({
        ...e,
        dbId: slugToId[e.slug] ?? (e.sourceSlug ? slugToId[e.sourceSlug] : null) ?? null,
      }));

      setEvents(mapped);
      setFetchedAt(new Date(data.fetchedAt));
      setCountdown(30); // Match 30s refresh interval
    } catch { /* keep old data */ }
    setLoading(false);
  }, [dbMatches]);

  useEffect(() => {
    const initial = fetchLive(); // Fetch immediately, don't wait
    const interval = setInterval(fetchLive, 30_000); // Re-fetch every 30s instead of 60s
    return () => clearInterval(interval);
  }, [fetchLive]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [fetchedAt]);

  const liveNow = events.filter(e => e.isLive);

  // Only show if there are actual live events
  if (!loading && liveNow.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: "var(--live)", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
            Live Now
          </h2>
          {liveNow.length > 0 && (
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
              background: "var(--live-dim)", color: "var(--live)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-sm)", padding: "2px 8px",
            }}>
              {liveNow.length} LIVE
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {fetchedAt && (
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-display)" }}>
              Refreshes in {countdown}s
            </span>
          )}
          <button onClick={fetchLive} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "4px 10px",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--text-muted)", cursor: "pointer",
          }}>
            {loading ? "Loading" : "Refresh"}
          </button>
        </div>
      </div>

      {loading && liveNow.length === 0 ? (
        <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ width: 260, flexShrink: 0, height: 120, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {liveNow.map(event => {
            const color = SPORT_COLORS[event.sport] ?? sportColor(event.sport);
            const href = event.dbId ? `/watch/${event.dbId}` : null;

            const card = (
              <div style={{
                width: 260, flexShrink: 0,
                background: "var(--card)", border: `1px solid ${event.isLive ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
                borderRadius: "var(--radius-lg)", overflow: "hidden",
                transition: "border-color 0.2s, transform 0.2s",
                cursor: href ? "pointer" : "default",
                position: "relative",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = color;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = event.isLive ? "rgba(239,68,68,0.4)" : "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ height: 2, background: event.isLive ? "var(--live)" : color }} />

                <div style={{ height: 70, background: "var(--surface)", position: "relative", overflow: "hidden" }}>
                  {event.poster && (
                    <img src={event.poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,10,18,0.9) 0%, transparent 60%)" }} />

                  <div style={{
                    position: "absolute", top: 6, left: 8,
                    background: "rgba(6,10,18,0.72)",
                    border: `1px solid ${color}55`,
                    borderRadius: "var(--radius-sm)",
                    padding: 4,
                  }}>
                    <SportIcon sport={event.sport} size={15} color={color} />
                  </div>

                  {event.isLive ? (
                    <div style={{
                      position: "absolute", top: 6, right: 8,
                      display: "flex", alignItems: "center", gap: 4,
                      background: "var(--live)", borderRadius: 3, padding: "2px 7px",
                    }}>
                      <span className="live-dot" style={{ width: 5, height: 5 }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 9, letterSpacing: "0.1em", color: "#fff" }}>LIVE</span>
                    </div>
                  ) : (
                    <div style={{
                      position: "absolute", top: 6, right: 8,
                      background: "rgba(6,10,18,0.8)", border: "1px solid var(--border)",
                      borderRadius: 3, padding: "2px 7px",
                    }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, color: "var(--text-muted)" }}>
                        {new Date(event.kickoff.replace(" ", "T") + ":00Z").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ padding: "8px 10px 10px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {event.league}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.teamA}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 9, color: "var(--text-dim)", flexShrink: 0 }}>VS</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{event.teamB}</span>
                  </div>
                  {event.embedUrls.length > 1 && (
                    <p style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.streamLabels?.slice(0, 3).join(" / ") || `${event.embedUrls.length} streams`} {event.embedUrls.length > 3 ? `+${event.embedUrls.length - 3}` : ""}
                    </p>
                  )}
                </div>
              </div>
            );

            return href ? (
              <Link key={event.slug} href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
                {card}
              </Link>
            ) : (
              <div key={event.slug} style={{ flexShrink: 0 }}>
                {card}
              </div>
            );
          })}

          {liveNow.length === 0 && !loading && (
            <div style={{ padding: "24px 0", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              No live events right now
            </div>
          )}
        </div>
      )}
    </div>
  );
}
