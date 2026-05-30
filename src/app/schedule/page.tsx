import Link from "next/link";
import { fetchAllMatches, fetchLiveMatches, StreamedMatch, encodeSources, matchThumbnailUrl } from "@/lib/streamed";
import { sportColor } from "@/lib/sportTheme";

export const dynamic = "force-dynamic";

type ScheduleSearchParams = {
  q?: string;
  sport?: string;
  source?: string;
};

function dayKey(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function dayLabel(date: Date) {
  const today = dayKey(new Date());
  return dayKey(date) === today
    ? "Today"
    : date.toLocaleDateString("en-US", { weekday: "short" });
}

function eventTime(match: StreamedMatch) {
  return new Date(match.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function displayLabel(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isLikelyLive(match: StreamedMatch, liveIds: Set<string>) {
  if (liveIds.has(match.id)) return true;
  const now = Date.now();
  return match.date <= now + 2 * 60_000 && match.date >= now - 4 * 60 * 60_000;
}

function groupByDay(matches: StreamedMatch[]) {
  const grouped = new Map<string, { date: Date; matches: StreamedMatch[] }>();

  for (const match of matches) {
    const date = new Date(match.date);
    const key = dayKey(date);
    const group = grouped.get(key) ?? { date, matches: [] };
    group.matches.push(match);
    grouped.set(key, group);
  }

  return [...grouped.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function sourceNames(matches: StreamedMatch[]) {
  const sources = new Set<string>();
  for (const match of matches) {
    for (const source of match.sources) sources.add(source.source);
  }
  return [...sources].sort((a, b) => a.localeCompare(b));
}

function categoryNames(matches: StreamedMatch[]) {
  return [...new Set(matches.map(match => match.category))].sort((a, b) => a.localeCompare(b));
}

function filterMatches(matches: StreamedMatch[], params: ScheduleSearchParams) {
  const q = params.q?.trim().toLowerCase();
  return matches.filter(match => {
    if (q && !match.title.toLowerCase().includes(q) && !match.category.toLowerCase().includes(q)) return false;
    if (params.sport && params.sport !== "all" && match.category !== params.sport) return false;
    if (params.source && params.source !== "all" && !match.sources.some(source => source.source === params.source)) return false;
    return true;
  });
}

function filterHref(next: Partial<ScheduleSearchParams>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value && value !== "all") params.set(key, value);
  }
  const query = params.toString();
  return query ? `/schedule?${query}` : "/schedule";
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<ScheduleSearchParams> }) {
  const params = await searchParams;
  let matches: StreamedMatch[] = [];
  let liveIds = new Set<string>();

  try {
    const [all, live] = await Promise.allSettled([fetchAllMatches(), fetchLiveMatches()]);
    matches = all.status === "fulfilled" ? all.value : [];
    liveIds = new Set(live.status === "fulfilled" ? live.value.map(match => match.id) : []);
  } catch {
    // show empty state
  }

  matches = matches
    .filter(match => match.sources.length > 0)
    .filter(match => match.date >= startOfToday())
    .sort((a, b) => a.date - b.date);

  const categories = categoryNames(matches);
  const sources = sourceNames(matches);
  const filtered = filterMatches(matches, params);
  const grouped = groupByDay(filtered);
  const liveCount = filtered.filter(match => isLikelyLive(match, liveIds)).length;

  return (
    <main className="schedule-page">
      <section className="schedule-toolbar">
        <div>
          <p className="schedule-eyebrow">Schedule</p>
          <h1 className="schedule-title">{filtered.length} Events</h1>
        </div>

        <form action="/schedule" className="schedule-search">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search" />
          {params.sport && params.sport !== "all" && <input type="hidden" name="sport" value={params.sport} />}
          {params.source && params.source !== "all" && <input type="hidden" name="source" value={params.source} />}
        </form>
      </section>

      <nav className="schedule-filters" aria-label="Schedule filters">
        <Link className={!params.sport || params.sport === "all" ? "active" : ""} href={filterHref({ q: params.q, source: params.source, sport: "all" })}>All Sports</Link>
        {categories.slice(0, 10).map(category => (
          <Link key={category} className={params.sport === category ? "active" : ""} href={filterHref({ q: params.q, source: params.source, sport: category })}>
            {displayLabel(category)}
          </Link>
        ))}
      </nav>

      <nav className="schedule-filters schedule-source-filters" aria-label="Source filters">
        <Link className={!params.source || params.source === "all" ? "active" : ""} href={filterHref({ q: params.q, sport: params.sport, source: "all" })}>All Sources</Link>
        {sources.slice(0, 8).map(source => (
          <Link key={source} className={params.source === source ? "active" : ""} href={filterHref({ q: params.q, sport: params.sport, source })}>
            {displayLabel(source)}
          </Link>
        ))}
        {liveCount > 0 && <span className="schedule-live-pill"><span className="live-dot" />{liveCount} Live</span>}
      </nav>

      {grouped.length === 0 ? (
        <div className="schedule-empty">No matches scheduled</div>
      ) : (
        <section className="schedule-groups">
          {grouped.map(group => (
            <div key={dayKey(group.date)} className="schedule-day">
              <div className="schedule-date">
                <span>{dayLabel(group.date)}</span>
                <strong>{group.date.toLocaleDateString("en-US", { day: "numeric" })}</strong>
                <em>{group.date.toLocaleDateString("en-US", { month: "short" })}</em>
              </div>

              <div className="schedule-events">
                {group.matches.map(match => {
                  const live = isLikelyLive(match, liveIds);
                  const color = sportColor(match.category);
                  return (
                    <Link key={match.id} href={`/watch/${match.id}?s=${encodeSources(match.sources)}`} className="schedule-event" style={{ ["--event-color" as string]: color }}>
                      <div className="schedule-thumb">
                        <img src={matchThumbnailUrl(match)} alt="" loading="lazy" />
                        <span className={live ? "schedule-time live" : "schedule-time"}>
                          {live ? "LIVE" : eventTime(match)}
                        </span>
                      </div>
                      <div className="schedule-event-body">
                        <h2>{match.title}</h2>
                        <p>{displayLabel(match.category)} | {eventTime(match)}</p>
                      </div>
                      <div className="schedule-meta">
                        <span>{match.sources.length} source{match.sources.length === 1 ? "" : "s"}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
