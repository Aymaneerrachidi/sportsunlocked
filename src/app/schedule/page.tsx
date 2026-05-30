import { fetchTodayMatches, StreamedMatch } from "@/lib/streamed";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let matches: StreamedMatch[] = [];
  try {
    matches = await fetchTodayMatches();
  } catch {
    // show empty state
  }

  // Group by category, sort within group by date
  const grouped: Record<string, StreamedMatch[]> = {};
  for (const m of matches) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }
  for (const arr of Object.values(grouped)) {
    arr.sort((a, b) => a.date - b.date);
  }

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 3, height: 24, background: "var(--accent)", borderRadius: 2 }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>
          Schedule
        </h1>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-dim)" }}>
          {today}
        </span>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          No matches scheduled today
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {Object.entries(grouped).map(([category, categoryMatches]) => (
            <div key={category}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  {category}
                </h2>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-dim)" }}>
                  {categoryMatches.length} match{categoryMatches.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {categoryMatches.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
