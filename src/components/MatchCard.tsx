"use client";
import Link from "next/link";
import SportIcon from "@/components/SportIcon";
import { sportColor } from "@/lib/sportTheme";

interface Match {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  sport: string;
  competition: string;
  startTime: string;
  isLive: boolean;
  status?: "upcoming" | "live" | "finished";
  thumbnail?: string | null;
}

function SportPlaceholder({ sport, teamA, teamB, color }: { sport: string; teamA: string; teamB: string; color: string }) {
  const showTeams = teamA !== "TBD" && teamB !== "TBD" && teamA !== teamB;
  const initA = teamA.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  const initB = teamB.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(135deg, ${color}22 0%, ${color}08 60%, rgba(6,10,18,0.6) 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10,
    }}>
      {/* subtle grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.18,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }} />
      {/* sport icon circle */}
      <div style={{
        position: "relative",
        width: 44, height: 44, borderRadius: "50%",
        background: `${color}18`, border: `1px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <SportIcon sport={sport} size={22} color={color} />
      </div>
      {/* team initials */}
      {showTeams && (
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 15, letterSpacing: "0.06em", color: "var(--text)" }}>{initA}</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", color, opacity: 0.8 }}>VS</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 15, letterSpacing: "0.06em", color: "var(--text)" }}>{initB}</span>
        </div>
      )}
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  const color = sportColor(match.sport);
  const start = new Date(match.startTime);
  const timeLabel = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const teamSports = ["Football", "Basketball", "Cricket", "Rugby", "Baseball", "Boxing", "Ice Hockey", "AFL", "American Football"];
  const showVS = teamSports.includes(match.sport) && match.teamA !== "TBD" && match.teamB !== "TBD";

  return (
    <Link href={`/watch/${match.id}`} style={{ textDecoration: "none", display: "block" }}>
      <article style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = color;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}
      >
        <div style={{ height: 2, background: color, opacity: match.isLive ? 1 : 0.35 }} />

<div style={{ position: "relative", aspectRatio: "16/9", background: "var(--surface)", overflow: "hidden" }}>
          {/* CSS placeholder is always the base layer */}
          <SportPlaceholder sport={match.sport} teamA={match.teamA} teamB={match.teamB} color={color} />
          {/* Real thumbnail sits on top; hidden on error so placeholder shows through */}
          {match.thumbnail && (
            <img
              src={match.thumbnail}
              alt={match.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(6,10,18,0.9) 0%, transparent 60%)",
          }} />

          {match.status === "live" ? (
            <div style={{
              position: "absolute", top: 8, right: 8,
              display: "flex", alignItems: "center", gap: 5,
              background: "var(--live)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 8px",
            }}>
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800, fontSize: 10,
                letterSpacing: "0.1em", color: "#fff",
                textTransform: "uppercase",
              }}>Live</span>
            </div>
          ) : match.status === "finished" ? (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(107,114,128,0.9)",
              border: "1px solid rgba(107,114,128,0.4)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 8px",
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600, fontSize: 10,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Finished</span>
            </div>
          ) : (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(6,10,18,0.75)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 8px",
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600, fontSize: 11,
                color: "var(--text-muted)",
              }}>{timeLabel}</span>
            </div>
          )}

          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(6,10,18,0.75)",
            border: `1px solid ${color}55`,
            borderRadius: "var(--radius-sm)",
            padding: 4,
          }}>
            <SportIcon sport={match.sport} size={15} color={color} />
          </div>
        </div>

        <div style={{ padding: "12px 14px 14px" }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600, fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color,
            marginBottom: 6,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {match.competition}
          </p>

          {showVS ? (
            // Team sports: show VS format
            (match.teamA === "TBD" || match.teamB === "TBD") ? (
              <div style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic", fontFamily: "var(--font-display)" }}>
                Match info pending
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: 16,
                  color: "var(--text)",
                  flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                }}>
                  {match.teamA}
                </span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800, fontSize: 11,
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                  flexShrink: 0,
                }}>VS</span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: 16,
                  color: "var(--text)",
                  flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textAlign: "right",
                  letterSpacing: "0.02em",
                }}>
                  {match.teamB}
                </span>
              </div>
            )
          ) : (
            // Individual sports (F1, Tennis, etc): show event title
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 16,
              color: "var(--text)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}>
              {match.title}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
