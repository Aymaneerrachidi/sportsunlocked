"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { decodeSources, StreamedStream } from "@/lib/streamed";

interface LoadedStream extends StreamedStream {
  sourceName: string;
}

export default function WatchPage() {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get("s") ?? "";
  const sources = useMemo(() => decodeSources(sourceParam), [sourceParam]);

  const [streams, setStreams] = useState<LoadedStream[]>([]);
  const [active, setActive] = useState<LoadedStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStreams = useCallback(async () => {
    if (sources.length === 0) {
      setError("No stream sources for this match.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const results: LoadedStream[] = [];
    await Promise.allSettled(
      sources.map(async ({ source, id }) => {
        try {
          const res = await fetch(`/api/stream/${source}/${id}`);
          if (!res.ok) return;
          const data: StreamedStream[] = await res.json();
          results.push(...data.map(s => ({ ...s, sourceName: source })));
        } catch {
          // skip failed source
        }
      })
    );

    if (results.length === 0) {
      setError("No streams available right now. Try again in a moment.");
      setLoading(false);
      return;
    }

    results.sort((a, b) => {
      if (a.hd && !b.hd) return -1;
      if (!a.hd && b.hd) return 1;
      return a.streamNo - b.streamNo;
    });

    setStreams(results);
    setActive(results[0]);
    setLoading(false);
  }, [sources]);

  useEffect(() => {
    const timeout = setTimeout(loadStreams, 0);
    return () => clearTimeout(timeout);
  }, [loadStreams]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
      <div style={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%",
        background: "#000",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        marginBottom: 16,
      }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Loading stream...
            </span>
          </div>
        )}

        {!loading && error && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--live)", letterSpacing: "0.06em" }}>{error}</span>
            <button onClick={loadStreams} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--accent)", color: "#060A12", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 20px", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {active && (
          <iframe
            key={`${active.sourceName}-${active.id}-${active.embedUrl}`}
            src={active.embedUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          />
        )}
      </div>

      {streams.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {streams.map(stream => (
            <button
              key={`${stream.sourceName}-${stream.id}-${stream.embedUrl}`}
              onClick={() => setActive(stream)}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: active?.embedUrl === stream.embedUrl ? "var(--accent)" : "var(--surface)",
                color: active?.embedUrl === stream.embedUrl ? "#060A12" : "var(--text-muted)",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {stream.sourceName} {stream.streamNo} - {stream.hd ? "HD" : "SD"}{stream.language !== "English" ? ` - ${stream.language}` : ""}
            </button>
          ))}
        </div>
      )}

      <Link href="/" style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", textDecoration: "none" }}>
        Back to matches
      </Link>
    </div>
  );
}
