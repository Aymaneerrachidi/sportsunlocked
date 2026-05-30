"use client";
import Link from "next/link";

interface HeroCardProps {
  match: {
    id: string;
    title: string;
    teamA: string;
    teamB: string;
    competition: string;
    isLive: boolean;
    thumbnail?: string | null;
  };
}

export default function HeroCard({ match }: HeroCardProps) {
  return (
    <Link href={`/watch/${match.id}`} style={{ textDecoration: "none", display: "block", marginBottom: 32 }}>
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          minHeight: 280,
          background: "var(--surface)",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
      >
        {match.thumbnail && (
          <img src={match.thumbnail} alt={match.title} style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.25,
          }} />
        )}

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }} />

        {/* Amber glow */}
        <div style={{
          position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)",
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          position: "relative",
          padding: "40px 40px 36px",
          background: "linear-gradient(90deg, rgba(6,10,18,0.95) 40%, rgba(6,10,18,0.5) 100%)",
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          <div style={{ maxWidth: 560 }}>
            {match.isLive && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--live)", borderRadius: "var(--radius-sm)",
                padding: "4px 10px", marginBottom: 12,
              }}>
                <span className="live-dot" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Live Now</span>
              </div>
            )}
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
              {match.competition}
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 48px)",
              letterSpacing: "0.01em", lineHeight: 1,
              color: "var(--text)", marginBottom: 20, textTransform: "uppercase",
            }}>
              {match.teamA}
              <span style={{ color: "var(--accent)", margin: "0 12px", fontSize: "0.7em" }}>vs</span>
              {match.teamB}
            </h1>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--accent)", color: "#060A12",
              borderRadius: "var(--radius-sm)", padding: "8px 20px",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <polygon points="3,2 13,8 3,14" fill="#060A12" />
              </svg>
              Watch Now
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
