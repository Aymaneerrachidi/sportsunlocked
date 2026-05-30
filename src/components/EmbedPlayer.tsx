"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface EmbedPlayerProps {
  embedUrls: string[];
  streamLabels?: string[];
  isLive?: boolean;
  isPremium?: boolean;
  matchId?: string;
  sport?: string;
  status?: "upcoming" | "live" | "finished";
  startTime?: string;
}

export default function EmbedPlayer({ embedUrls, streamLabels, isLive, isPremium, status, startTime }: EmbedPlayerProps) {
  const [server, setServer] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [canSkip, setCanSkip] = useState(false);
  const [showPreroll, setShowPreroll] = useState(!isPremium);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [streamHealth, setStreamHealth] = useState<"checking" | "ok" | "down">("checking");
  // Track consecutive failures to stop auto-switching once all servers have been tried
  const failedServers = useRef<Set<number>>(new Set());

  const checkHealth = useCallback(async (url: string, currentServer: number, totalServers: number) => {
    setStreamHealth("checking");
    try {
      const res = await fetch(`/api/stream-health?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.ok) {
        failedServers.current.delete(currentServer);
        setStreamHealth("ok");
      } else {
        failedServers.current.add(currentServer);
        setStreamHealth("down");
        // Auto-advance only if there is an untried server
        if (totalServers > 1 && failedServers.current.size < totalServers) {
          setServer((s) => (s + 1) % totalServers);
        }
      }
    } catch {
      failedServers.current.add(currentServer);
      setStreamHealth("down");
      if (totalServers > 1 && failedServers.current.size < totalServers) {
        setServer((s) => (s + 1) % totalServers);
      }
    }
  }, []);

  // Clear failed-server tracking when the embed URL list changes
  useEffect(() => {
    failedServers.current = new Set();
  }, [embedUrls]);

  useEffect(() => {
    const url = embedUrls[server];
    if (!url) return;
    const timeout = setTimeout(() => {
      void checkHealth(url, server, embedUrls.length);
    }, 0);
    return () => clearTimeout(timeout);
  }, [server, embedUrls, checkHealth]);

  useEffect(() => {
    if (!showPreroll || isPremium) return;
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        const next = c - 1;
        if (next <= 10) setCanSkip(true);
        if (next <= 0) { setShowPreroll(false); clearInterval(timerRef.current!); }
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showPreroll, isPremium]);

  if (showPreroll) {
    return (
      <div style={{
        width: "100%", aspectRatio: "16/9",
        background: "var(--surface)",
        borderRadius: "var(--radius-xl)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        border: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "32px 32px", opacity: 0.2,
        }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 32 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dim)" }}>Advertisement</p>
          <div data-ad-slot="preroll" style={{
            width: "min(380px, 90%)", padding: "24px 28px",
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", textAlign: "center",
          }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)", marginBottom: 6 }}>Go Premium</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>Skip all ads and enjoy uninterrupted sports streaming.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Stream starts in <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text)" }}>{countdown}s</span>
            </p>
            <button
              onClick={() => canSkip && setShowPreroll(false)}
              style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "8px 20px", borderRadius: "var(--radius-sm)",
                border: canSkip ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: canSkip ? "var(--accent)" : "transparent",
                color: canSkip ? "#060A12" : "var(--text-dim)",
                cursor: canSkip ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}
            >
              {canSkip ? "Skip Ad →" : `Skip in ${Math.max(0, countdown - 10)}s`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalUrls = embedUrls;
  const finalLabels = streamLabels ?? [];

  if (finalUrls.length === 0) {
    const isUpcoming = status === "upcoming" || (startTime && new Date(startTime) > new Date());
    const isFinished = status === "finished";
    const kickoffLabel = startTime
      ? new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null;

    return (
      <div style={{ width: "100%", aspectRatio: "16/9", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
        <p style={{ fontSize: 36 }}>{isFinished ? "🏁" : isUpcoming ? "⏱" : "📡"}</p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "center" }}>
          {isFinished ? "Match finished" : isUpcoming ? "Stream not live yet" : "No stream found"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>
          {isFinished
            ? "This match has ended."
            : isUpcoming
            ? kickoffLabel
              ? `Streams go live at kick-off · ${kickoffLabel}`
              : "Streams go live at kick-off"
            : "Try refreshing — the source may be temporarily down."}
        </p>
        {!isFinished && !isUpcoming && (
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "7px 18px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-muted)", cursor: "pointer", marginTop: 4,
            }}
          >
            Refresh page
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#000" }}>
      {isLive && (
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 10,
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--live)",
          borderRadius: "var(--radius-sm)",
          padding: "4px 10px",
        }}>
          <span className="live-dot" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Live</span>
        </div>
      )}

      <iframe
        src={finalUrls[server]}
        style={{ width: "100%", height: "100%", border: "none" }}
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        scrolling="no"
        referrerPolicy="no-referrer"
      />

      {/* SportBusy attribution for fallback streams */}
      {embedUrls.length === 0 && (
        <div style={{
          position: "absolute", bottom: 8, left: 8, zIndex: 10,
          background: "rgba(6,10,18,0.85)",
          borderRadius: "var(--radius-sm)",
          padding: "2px 8px",
          backdropFilter: "blur(2px)",
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 9, color: "var(--text-dim)" }}>Powered by SportBusy</span>
        </div>
      )}

      {/* Stream health badge */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(6,10,18,0.75)", borderRadius: 4, padding: "3px 8px", backdropFilter: "blur(4px)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: streamHealth === "ok" ? "#10B981" : streamHealth === "down" ? "#EF4444" : "#F59E0B", flexShrink: 0, animation: streamHealth === "checking" ? "live-pulse 1s infinite" : "none" }} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: streamHealth === "ok" ? "#10B981" : streamHealth === "down" ? "#EF4444" : "#F59E0B" }}>
          {streamHealth === "ok" ? "Stream Online" : streamHealth === "down" ? "Stream Offline" : "Checking…"}
        </span>
      </div>

      {finalUrls.length > 1 && (
        <div style={{
          position: "absolute", bottom: 12, right: 12, zIndex: 10,
          display: "flex", gap: 4,
        }}>
          {finalUrls.map((_, i) => (
            <button key={i} onClick={() => setServer(i)} style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              border: server === i ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.2)",
              background: server === i ? "var(--accent)" : "rgba(6,10,18,0.7)",
              color: server === i ? "#060A12" : "#fff",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}>
              {finalLabels[i] ?? `S${i + 1}`}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
