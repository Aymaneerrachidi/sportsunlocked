import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MatchCard from "@/components/MatchCard";
import HeroCard from "@/components/HeroCard";
import LiveNow from "@/components/LiveNow";
import Link from "next/link";
import HomeTabs from "@/components/HomeTabs";

const SPORTS = ["All", "Football", "Basketball", "Tennis", "F1", "Cricket", "Rugby", "Baseball", "Boxing"];

export const dynamic = "force-dynamic";

type SessionUser = { isPremium?: boolean };
type Match = {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  sport: string;
  competition: string;
  startTime: string; // ISO string from API
  status: "upcoming" | "live" | "finished";
  isLive: boolean;
  thumbnail?: string | null;
  embedUrl?: string | null;
  externalId?: string | null;
  stream1?: string | null;
  stream2?: string | null;
  stream3?: string | null;
  channelId?: string;
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sp = await searchParams;
  const sport = sp.sport ?? "All";
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const isPremium = user?.isPremium;

  try {
    // Fetch from unified events endpoint using appropriate base URL
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = process.env.VERCEL_URL || process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, "") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/events`, {
      next: { revalidate: 10 }, // Cache for 10 seconds (down from 30)
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Events API returned:", res.status, res.statusText);
      throw new Error(`Events API returned ${res.status}`);
    }

    const data = await res.json();
    let matches: Match[] = data.events || [];
    const allMatches = matches.map(m => ({ id: m.id, externalId: m.externalId || null }));

    // Filter by sport if specified
    if (sport !== "All") {
      matches = matches.filter((m: Match) => m.sport === sport);
    }

    // Already sorted by /api/events: live → upcoming by startTime → finished
    // But ensure live events come first
    const live = matches.filter(m => m.status === "live");
    const upcoming = matches.filter(m => m.status === "upcoming");
    const finished = matches.filter(m => m.status === "finished");

    const normalizedMatches = [...live, ...upcoming];
    const featured = normalizedMatches[0] ?? finished[0];

    return (
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Live Now — always fresh from EmbedSportex, auto-refreshes */}
        {sport === "All" && (
          <LiveNow dbMatches={allMatches} />
        )}

        {/* Hero — featured match from DB */}
        {featured && (
          <HeroCard match={{
            id: featured.id, title: featured.title, teamA: featured.teamA,
            teamB: featured.teamB, competition: featured.competition,
            isLive: featured.status === "live", thumbnail: featured.thumbnail,
          }} />
        )}

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 3, height: 20, background: "var(--accent)", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
              {sport === "All" ? "Schedule" : sport}
            </h2>
            {live.length > 0 && (
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", background: "var(--live-dim)", color: "var(--live)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "2px 8px" }}>
                {live.length} LIVE
              </span>
            )}
          </div>
          <HomeTabs sports={SPORTS} active={sport} />
        </div>

        {/* Match grid */}
        {normalizedMatches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            No matches found
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {normalizedMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}

        {/* Premium sticky banner */}
        {!isPremium && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(90deg, #0C1220 0%, #0F1A2E 100%)", borderTop: "1px solid var(--border)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 40, backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "0.03em", color: "var(--text)" }}>Watch Ad-Free with Premium</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>From $4.99/mo — cancel anytime</p>
              </div>
            </div>
            <Link href="/premium" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--accent)", color: "#060A12", textDecoration: "none", padding: "7px 16px", borderRadius: "var(--radius-sm)" }}>Upgrade</Link>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return (
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Failed to load events
        </div>
      </div>
    );
  }
}
