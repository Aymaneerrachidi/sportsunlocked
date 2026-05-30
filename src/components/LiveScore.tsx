"use client";
import { useEffect, useState } from "react";

interface LiveScoreProps {
  externalId: string | null;
  teamA: string;
  teamB: string;
  isLive: boolean;
}

interface Score {
  homeScore: string | null;
  awayScore: string | null;
  status: string | null;
  clock: string | null;
}

export default function LiveScore({ externalId, teamA, teamB, isLive }: LiveScoreProps) {
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    // Extract TheSportsDB event ID from externalId (format: sportsdb-1234567)
    const eventId = externalId?.startsWith("sportsdb-")
      ? externalId.replace("sportsdb-", "")
      : null;

    if (!eventId) return;

    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${eventId}`
        );
        const data = await res.json();
        const ev = data.events?.[0];
        if (ev) {
          setScore({
            homeScore: ev.intHomeScore ?? null,
            awayScore: ev.intAwayScore ?? null,
            status: ev.strStatus ?? null,
            clock: ev.strProgress ?? ev.intRound ?? null,
          });
        }
      } catch { /* ignore */ }
      setLoading(false);
    };

    fetch_();
    const interval = setInterval(fetch_, 30_000);
    return () => clearInterval(interval);
  }, [externalId, isLive]);

  if (!isLive || !score) return null;

  const hasScore = score.homeScore !== null && score.awayScore !== null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: "14px 20px",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      marginTop: 10,
    }}>
      {/* Team A */}
      <div style={{ textAlign: "right", flex: 1 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(14px,2vw,20px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)" }}>{teamA}</p>
      </div>

      {/* Score */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        {hasScore ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,4vw,44px)", color: "var(--text)", lineHeight: 1 }}>{score.homeScore}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 20, color: "var(--border-bright)" }}>–</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,4vw,44px)", color: "var(--text)", lineHeight: 1 }}>{score.awayScore}</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", color: "var(--live)" }}>LIVE</span>
          </div>
        )}
        {score.clock && (
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginTop: 2 }}>
            {score.clock}
          </p>
        )}
      </div>

      {/* Team B */}
      <div style={{ textAlign: "left", flex: 1 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(14px,2vw,20px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)" }}>{teamB}</p>
      </div>
    </div>
  );
}
