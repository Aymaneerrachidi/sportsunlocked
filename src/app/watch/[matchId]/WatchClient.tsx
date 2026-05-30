"use client";
import EmbedPlayer from "@/components/EmbedPlayer";
import AdBanner from "@/components/AdBanner";
import LiveScore from "@/components/LiveScore";
import WatchLogger from "@/components/WatchLogger";
import Link from "next/link";
function getDefaultThumbnail(sport: string): string {
  return `/thumbnails/${sport.toLowerCase()}.jpg`;
}

const SPORT_COLORS: Record<string, string> = {
  Football: "var(--sport-football)", Basketball: "var(--sport-basketball)",
  Tennis: "var(--sport-tennis)", F1: "var(--sport-f1)", Cricket: "var(--sport-cricket)",
  Rugby: "var(--sport-rugby)", Baseball: "var(--sport-baseball)", Boxing: "var(--sport-boxing)",
};

interface Match {
  id: string; title: string; teamA: string; teamB: string;
  sport: string; competition: string; startTime: string; isLive: boolean;
  status?: string;
  thumbnail?: string | null; stream1?: string | null; stream2?: string | null;
  stream3?: string | null; channelUrl?: string | null; channelId?: string | null;
  embedUrls?: string[]; streamLabels?: string[]; externalId?: string | null;
}

export default function WatchClient({ match, related, isPremium }: { match: Match; related: Match[]; isPremium: boolean }) {
  const hlsSources = [match.channelUrl, match.stream1, match.stream2, match.stream3].filter(Boolean) as string[];
  const embedUrls = match.embedUrls ?? [];
  const sportColor = SPORT_COLORS[match.sport] ?? "var(--accent)";

  const renderPlayer = () => {
    const playerProps = { isLive: match.isLive, isPremium, matchId: match.id, sport: match.sport, status: match.status as "upcoming"|"live"|"finished"|undefined, startTime: match.startTime };
    if (embedUrls.length > 0) return <EmbedPlayer embedUrls={embedUrls} streamLabels={match.streamLabels} {...playerProps} />;
    if (hlsSources.length > 0) return <div />;
    return <EmbedPlayer embedUrls={[]} {...playerProps} />;
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 40px" }}>
      <WatchLogger matchId={match.id} />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderPlayer()}

          {/* Live score bar — appears below player for live matches */}
          {match.isLive && (
            <LiveScore
              externalId={match.externalId ?? null}
              teamA={match.teamA}
              teamB={match.teamB}
              isLive={match.isLive}
            />
          )}

          {/* Match info card */}
          <div style={{ marginTop: 10, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ height: 2, background: sportColor }} />
            <div style={{ padding: "14px 18px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: sportColor, marginBottom: 4 }}>{match.competition}</p>
                  <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(16px, 2.5vw, 24px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)", lineHeight: 1 }}>{match.title}</h1>
                </div>
                {match.isLive && (
                  <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, background: "var(--live-dim)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "var(--radius-sm)", padding: "4px 10px" }}>
                    <span className="live-dot" />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--live)" }}>Live</span>
                  </div>
                )}
              </div>

              {/* Teams */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(16px,2.5vw,28px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)", lineHeight: 1 }}>{match.teamA}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginTop: 3 }}>Home</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", color: "var(--border-bright)" }}>VS</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginTop: 2 }}>{match.sport}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(16px,2.5vw,28px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)", lineHeight: 1 }}>{match.teamB}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginTop: 3 }}>Away</p>
                </div>
              </div>
            </div>
          </div>

          {!isPremium && <div style={{ marginTop: 10 }}><AdBanner type="banner" matchId={match.id} /></div>}
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0 }}>
          {!isPremium && <div style={{ marginBottom: 14 }}><AdBanner type="sidebar" matchId={match.id} /></div>}

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Live & Upcoming</p>
            </div>
            {related.map((r, i) => {
              const rThumbnail = r.thumbnail ?? getDefaultThumbnail(r.sport);
              return (
                <Link key={r.id} href={`/watch/${r.id}`} style={{ display: "flex", gap: 10, padding: "9px 14px", borderBottom: i < related.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <img src={rThumbnail} alt={r.title} style={{ width: 72, height: 44, objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0, opacity: 0.8 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2, marginBottom: 3 }}>{r.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.competition}</p>
                    {r.isLive && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <span className="live-dot" style={{ width: 5, height: 5 }} />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: "var(--live)" }}>LIVE</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
            {related.length === 0 && (
              <p style={{ padding: "20px 14px", fontSize: 12, color: "var(--text-dim)", textAlign: "center" }}>No other live events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}