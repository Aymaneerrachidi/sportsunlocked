"use client";
import Link from "next/link";
import { StreamedMatch, badgeUrl, encodeSources, matchThumbnailUrl } from "@/lib/streamed";
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
  const thumbnail = matchThumbnailUrl(match);

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
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,10,18,0.82), rgba(6,10,18,0.34), rgba(6,10,18,0.82))" }} />
          {badgeA && <img src={badgeUrl(badgeA)} alt={teamA} width={40} height={40} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} />}
          {badgeB && <img src={badgeUrl(badgeB)} alt={teamB} width={40} height={40} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} />}
          {!badgeA && !badgeB && (
            <div style={{ position: "relative", zIndex: 1 }}>
              <SportIcon sport={match.category} size={32} color={color} muted />
            </div>
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
