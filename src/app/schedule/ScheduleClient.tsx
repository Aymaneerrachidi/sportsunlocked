"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import SportIcon from "@/components/SportIcon";
import { sportColor } from "@/lib/sportTheme";

const SPORTS = [
  "All", "Football", "Basketball", "Tennis", "Boxing", "Cricket",
  "Rugby", "Baseball", "Ice Hockey", "AFL", "American Football",
  "Motor Sports", "Golf", "Darts", "F1", "Other",
];

interface Match {
  id: string; title: string; teamA: string; teamB: string;
  sport: string; competition: string; startTime: string; isLive: boolean;
  status?: string; thumbnail?: string | null;
}

function formatTime(isoString: string, timezone?: string) {
  const d = new Date(isoString);
  if (timezone) {
    try {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      }).format(d);
    } catch { /* fall through */ }
  }
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(isoString: string, timezone?: string) {
  const d = new Date(isoString);
  if (timezone) {
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: timezone,
      }).format(d);
    } catch { /* fall through */ }
  }
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function ScheduleClient({ matches }: { matches: Match[] }) {
  const [sport, setSport] = useState("All");
  const [reminders, setReminders] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ls_reminders") ?? "[]"); } catch { return []; }
  });

  // Detect timezone on initial render only
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
  }, []);

  // Client-side: also hide anything explicitly marked finished
  const now = new Date();
  const visible = matches.filter(m => {
    if (m.status === "finished" && !m.isLive) return false;
    // Hide if started > 2 hours ago and not live
    if (!m.isLive && new Date(m.startTime) < new Date(now.getTime() - 2 * 60 * 60 * 1000)) return false;
    return true;
  });
  const filtered = sport === "All" ? visible : visible.filter(m => m.sport === sport);

  const grouped = useMemo(() => {
    const g: Record<string, Match[]> = {};
    for (const m of filtered) {
      const day = formatDay(m.startTime, timezone);
      if (!g[day]) g[day] = [];
      g[day].push(m);
    }
    return g;
  }, [filtered, timezone]);

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const next = prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id];
      localStorage.setItem("ls_reminders", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 3, height: 24, background: "var(--accent)", borderRadius: 2 }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)" }}>Schedule</h1>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 28 }}>
        {SPORTS.map(s => {
          const active = sport === s;
          return (
            <button key={s} onClick={() => setSport(s)} style={{
              fontFamily: "var(--font-display)", fontWeight: active ? 700 : 600, fontSize: 11,
              letterSpacing: "0.08em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              background: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
            }}>
              <SportIcon sport={s} size={13} color="currentColor" />
              {s}
            </button>
          );
        })}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-dim)", fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          No matches scheduled
        </div>
      )}

      {Object.entries(grouped).map(([day, dayMatches]) => (
        <div key={day} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>{day}</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {dayMatches.map(m => {
              const color = sportColor(m.sport);
              const reminded = reminders.includes(m.id);
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  borderLeft: `3px solid ${m.isLive ? "var(--live)" : color}`,
                  transition: "border-color 0.15s",
                }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface)",
                    border: `1px solid ${color}55`,
                    borderRadius: "var(--radius-sm)",
                  }}>
                    <SportIcon sport={m.sport} size={17} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{m.competition}</p>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    {m.isLive ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span className="live-dot" />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", color: "var(--live)" }}>LIVE</span>
                      </div>
                    ) : (
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>{formatTime(m.startTime, timezone)}</span>
                    )}
                  </div>
                  <Link href={`/watch/${m.id}`} style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    background: "var(--accent)", color: "#060A12",
                    textDecoration: "none", padding: "5px 12px",
                    borderRadius: "var(--radius-sm)", flexShrink: 0,
                  }}>Watch</Link>
                  <button onClick={() => toggleReminder(m.id)} title={reminded ? "Remove reminder" : "Set reminder"} style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: reminded ? "var(--accent)" : "var(--text-dim)",
                    flexShrink: 0,
                    opacity: reminded ? 1 : 0.55,
                    transition: "opacity 0.15s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = reminded ? "1" : "0.55"; }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      {!reminded && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}