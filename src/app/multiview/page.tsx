"use client";
import { useState, useEffect } from "react";
import EmbedPlayer from "@/components/EmbedPlayer";
import Link from "next/link";

interface Match {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  sport: string;
  isLive: boolean;
  embedUrl?: string | null;
}

export default function MultiViewPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<(Match | null)[]>([null, null, null, null]);
  const [layout, setLayout] = useState<2 | 4>(2);

  useEffect(() => {
    fetch("/api/matches")
      .then(r => r.json())
      .then((data: Match[]) => setMatches(data.filter(m => m.embedUrl || m.isLive)));
  }, []);

  const assign = (slot: number, match: Match | null) => {
    setSelected(prev => { const next = [...prev]; next[slot] = match; return next; });
  };

  const slots = selected.slice(0, layout);

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: "20px 16px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 22, background: "var(--accent)", borderRadius: 2 }} />
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>Multi-View</h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {([2, 4] as const).map(n => (
            <button key={n} onClick={() => setLayout(n)} style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "6px 14px", borderRadius: "var(--radius-sm)",
              border: `1px solid ${layout === n ? "var(--accent)" : "var(--border)"}`,
              background: layout === n ? "var(--accent-dim)" : "transparent",
              color: layout === n ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
            }}>
              {n === 2 ? "2 Streams" : "4 Streams"}
            </button>
          ))}
          <Link href="/" style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "6px 14px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", color: "var(--text-muted)",
            textDecoration: "none",
          }}>← Back</Link>
        </div>
      </div>

      {/* Player grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: layout === 2 ? "1fr 1fr" : "1fr 1fr",
        gridTemplateRows: layout === 4 ? "1fr 1fr" : "1fr",
        gap: 8,
        marginBottom: 20,
      }}>
        {slots.map((match, i) => (
          <div key={i} style={{ position: "relative" }}>
            {match?.embedUrl ? (
              <EmbedPlayer embedUrls={[match.embedUrl]} isLive={match.isLive} isPremium={true} />
            ) : (
              <div style={{
                aspectRatio: "16/9", background: "var(--surface)",
                border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Slot {i + 1}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Select a match below</p>
              </div>
            )}
            {/* Slot label */}
            <div style={{ position: "absolute", top: 8, left: 8, zIndex: 20, display: "flex", alignItems: "center", gap: 6, background: "rgba(6,10,18,0.8)", borderRadius: 4, padding: "3px 8px", backdropFilter: "blur(4px)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10, letterSpacing: "0.1em", color: "var(--accent)" }}>S{i + 1}</span>
              {match && <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, color: "var(--text-muted)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{match.title}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Match picker */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Select streams — click a slot number then pick a match
          </p>
        </div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {matches.length === 0 ? (
            <p style={{ padding: "20px 16px", fontSize: 13, color: "var(--text-dim)" }}>No streamable matches found. Sync live events from admin first.</p>
          ) : (
            matches.map(m => (
              <div key={m.id} style={{ flexShrink: 0, borderRight: "1px solid var(--border)", padding: "12px 14px", minWidth: 180 }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                {m.isLive && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: "var(--live)" }}>LIVE</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {slots.map((_, i) => (
                    <button key={i} onClick={() => assign(i, m)} style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      padding: "3px 8px", borderRadius: 3,
                      border: "1px solid var(--border)",
                      background: selected[i]?.id === m.id ? "var(--accent)" : "transparent",
                      color: selected[i]?.id === m.id ? "#060A12" : "var(--text-muted)",
                      cursor: "pointer",
                    }}>S{i + 1}</button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
