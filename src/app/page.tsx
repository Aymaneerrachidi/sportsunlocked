import LiveNow from "@/components/LiveNow";
import MatchCard from "@/components/MatchCard";
import HomeTabs from "@/components/HomeTabs";
import { fetchTodayMatches, fetchMatchesBySport, StreamedMatch } from "@/lib/streamed";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SPORTS = ["All", "Football", "Basketball", "Tennis", "Hockey", "Boxing", "Cricket", "Rugby", "Motor Sports", "Golf", "Darts"];

const SPORT_SLUG: Record<string, string> = {
  Football: "football",
  Basketball: "basketball",
  Tennis: "tennis",
  Hockey: "hockey",
  Boxing: "boxing",
  Cricket: "cricket",
  Rugby: "rugby",
  "Motor Sports": "motorsports",
  Golf: "golf",
  Darts: "darts",
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sp = await searchParams;
  const sport = sp.sport ?? "All";

  let matches: StreamedMatch[] = [];
  try {
    if (sport === "All") {
      matches = await fetchTodayMatches();
    } else {
      const slug = SPORT_SLUG[sport] ?? sport.toLowerCase();
      matches = await fetchMatchesBySport(slug);
    }
  } catch {
    // LiveNow still renders client-side; grid shows empty state
  }

  // Popular matches first, then by date ascending
  matches.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.date - b.date;
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 60px" }}>
      <section className="home-intro">
        <div>
          <p className="schedule-eyebrow">Sports Schedule Companion</p>
          <h1>Live Event Tracker For Busy Sports Days</h1>
          <p>
            Browse today&apos;s events, compare start times, filter by sport, and plan what to follow next. SportUnlocked
            organizes live and upcoming sports into a fast schedule-first interface.
          </p>
        </div>
        <Link href="/guides">Read Guides</Link>
      </section>

      <LiveNow />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 3, height: 20, background: "var(--accent)", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
            {sport === "All" ? "Today" : sport}
          </h2>
        </div>
        <HomeTabs sports={SPORTS} active={sport} />
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          No matches found
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {matches.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
