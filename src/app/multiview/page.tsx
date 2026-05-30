"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StreamedMatch, StreamedStream, encodeSources, matchThumbnailUrl } from "@/lib/streamed";
import { sportColor } from "@/lib/sportTheme";

type LoadedStream = StreamedStream & {
  sourceName: string;
};

type Slot = {
  match: StreamedMatch;
  streams: LoadedStream[];
  active: LoadedStream;
};

const SLOT_COUNT = 4;
const LIVE_PRE_ROLL_MS = 2 * 60_000;
const LIVE_FALLBACK_WINDOW_MS = 4 * 60 * 60_000;

function isWatchable(match: StreamedMatch) {
  const now = Date.now();
  return match.sources.length > 0 && match.date <= now + LIVE_PRE_ROLL_MS && match.date >= now - LIVE_FALLBACK_WINDOW_MS;
}

function mergeMatches(live: StreamedMatch[], today: StreamedMatch[]) {
  const byId = new Map<string, StreamedMatch>();
  for (const match of [...today.filter(isWatchable), ...live]) {
    if (match.sources.length > 0) byId.set(match.id, match);
  }
  return [...byId.values()].sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.date - b.date;
  });
}

function sortStreams(streams: LoadedStream[]) {
  return streams.sort((a, b) => {
    if (a.hd && !b.hd) return -1;
    if (!a.hd && b.hd) return 1;
    return a.streamNo - b.streamNo;
  });
}

async function loadMatchStreams(match: StreamedMatch) {
  const settled = await Promise.allSettled(
    match.sources.map(async ({ source, id }) => {
      const res = await fetch(`/api/stream/${source}/${id}`);
      if (!res.ok) return [];
      const streams = await res.json() as StreamedStream[];
      return streams.map(stream => ({ ...stream, sourceName: source }));
    })
  );

  return sortStreams(settled.flatMap(result => result.status === "fulfilled" ? result.value : []));
}

export default function MultiViewPage() {
  const [matches, setMatches] = useState<StreamedMatch[]>([]);
  const [slots, setSlots] = useState<(Slot | null)[]>(Array(SLOT_COUNT).fill(null));
  const [layout, setLayout] = useState<2 | 4>(2);
  const [activeSlot, setActiveSlot] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleSlots = useMemo(() => slots.slice(0, layout), [slots, layout]);

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    setError(null);

    try {
      const [liveResult, todayResult] = await Promise.allSettled([
        fetch(`/api/matches/live?t=${Date.now()}`, { cache: "no-store" }).then(res => res.json() as Promise<StreamedMatch[]>),
        fetch(`/api/matches/all-today?t=${Date.now()}`, { cache: "no-store" }).then(res => res.json() as Promise<StreamedMatch[]>),
      ]);

      const live = liveResult.status === "fulfilled" && Array.isArray(liveResult.value) ? liveResult.value : [];
      const today = todayResult.status === "fulfilled" && Array.isArray(todayResult.value) ? todayResult.value : [];
      setMatches(mergeMatches(live, today));
    } catch {
      setError("Could not load Streamed matches.");
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadMatches, 0);
    const interval = setInterval(loadMatches, 30_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadMatches]);

  const assign = async (slotIndex: number, match: StreamedMatch) => {
    setActiveSlot(slotIndex);
    setLoadingSlot(slotIndex);
    setError(null);

    const streams = await loadMatchStreams(match);
    if (streams.length === 0) {
      setError("No streams available for that match yet.");
      setLoadingSlot(null);
      return;
    }

    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = { match, streams, active: streams[0] };
      return next;
    });
    setLoadingSlot(null);
  };

  const setActiveStream = (slotIndex: number, stream: LoadedStream) => {
    setSlots(prev => {
      const next = [...prev];
      const slot = next[slotIndex];
      if (slot) next[slotIndex] = { ...slot, active: stream };
      return next;
    });
  };

  return (
    <main className="multiview-page">
      <section className="multiview-header">
        <div>
          <p className="schedule-eyebrow">Multi Stream</p>
          <h1 className="schedule-title">Multi-View</h1>
        </div>
        <div className="multiview-actions">
          {([2, 4] as const).map(count => (
            <button key={count} className={layout === count ? "active" : ""} onClick={() => setLayout(count)}>
              {count} Streams
            </button>
          ))}
          <button onClick={loadMatches}>Refresh</button>
          <Link href="/">Back</Link>
        </div>
      </section>

      {error && <div className="multiview-error">{error}</div>}

      <div className="multiview-shell">
        <section className={layout === 2 ? "multiview-grid two" : "multiview-grid four"}>
          {visibleSlots.map((slot, index) => (
            <div key={index} className={activeSlot === index ? "multiview-slot active" : "multiview-slot"} onClick={() => setActiveSlot(index)}>
              {slot ? (
                <>
                  <iframe
                    key={slot.active.embedUrl}
                    src={slot.active.embedUrl}
                    allow="autoplay; fullscreen; encrypted-media"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                  />
                  <div className="multiview-slot-label">
                    <strong>S{index + 1}</strong>
                    <span>{slot.match.title}</span>
                  </div>
                  {slot.streams.length > 1 && (
                    <div className="multiview-streams">
                      {slot.streams.slice(0, 6).map(stream => (
                        <button
                          key={`${stream.sourceName}-${stream.id}-${stream.embedUrl}`}
                          className={stream.embedUrl === slot.active.embedUrl ? "active" : ""}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveStream(index, stream);
                          }}
                        >
                          {stream.sourceName} {stream.streamNo}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="multiview-empty">
                  <strong>{loadingSlot === index ? "Loading" : `Slot ${index + 1}`}</strong>
                  <span>{loadingSlot === index ? "Fetching stream..." : "Pick a live event"}</span>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="multiview-picker">
          <div className="multiview-picker-head">
            <span>{loadingMatches ? "Loading events" : `${matches.length} events`}</span>
            <span>S{activeSlot + 1}</span>
          </div>
          <div className="multiview-match-list">
            {matches.length === 0 && !loadingMatches ? (
              <p className="multiview-none">No live or starting-soon Streamed events found.</p>
            ) : (
              matches.map(match => {
                const color = sportColor(match.category);
                return (
                  <button key={match.id} className="multiview-match" onClick={() => assign(activeSlot, match)} style={{ ["--event-color" as string]: color }}>
                    <img src={matchThumbnailUrl(match)} alt="" loading="lazy" />
                    <span>
                      <strong>{match.title}</strong>
                      <em>{match.category} | {match.sources.length} source{match.sources.length === 1 ? "" : "s"}</em>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
