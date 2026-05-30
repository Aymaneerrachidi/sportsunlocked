"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  sources: string[];
  isLive?: boolean;
  isPremium?: boolean;
  matchId?: string;
  channelId?: string | null;
}

export default function HlsPlayer({ sources, isLive, isPremium, matchId, channelId }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [sourceIdx, setSourceIdx] = useState(0);
  const [qualities, setQualities] = useState<{ label: string; index: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [buffering, setBuffering] = useState(false);
  const [showPreroll, setShowPreroll] = useState(!isPremium);
  const [prerollCountdown, setPrerollCountdown] = useState(15);
  const [canSkip, setCanSkip] = useState(false);
  const [showMidroll, setShowMidroll] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const proxyUrl = (url: string) => {
    const cid = channelId ? `&cid=${channelId}` : "";
    return `/api/proxy?url=${encodeURIComponent(url)}${cid}`;
  };

  const loadSource = useCallback(
    (idx: number) => {
      const video = videoRef.current;
      if (!video || !sources[idx]) return;
      const src = proxyUrl(sources[idx]);

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels = data.levels.map((l, i) => ({
            label: l.height ? `${l.height}p` : `Source ${i + 1}`,
            index: i,
          }));
          setQualities([{ label: "Auto", index: -1 }, ...levels]);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            const next = idx + 1;
            if (next < sources.length) {
              loadSource(next);
              setSourceIdx(next);
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.play().catch(() => {});
      }
    },
    [sources]
  );

  // Pre-roll countdown
  useEffect(() => {
    if (!showPreroll || isPremium) return;
    if (prerollCountdown <= 0) return;
    const timer = setTimeout(() => {
      setPrerollCountdown((c) => c - 1);
      if (prerollCountdown === 11) setCanSkip(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showPreroll, prerollCountdown, isPremium]);

  // Load player after pre-roll
  useEffect(() => {
    if (showPreroll) return;
    const savedVol = parseFloat(localStorage.getItem("ls_volume") ?? "1");
    setVolume(savedVol);
    if (videoRef.current) videoRef.current.volume = savedVol;
    loadSource(sourceIdx);
  }, [showPreroll, loadSource, sourceIdx]);

  // Mid-roll ads every 15 min
  useEffect(() => {
    if (showPreroll || isPremium) return;
    watchTimerRef.current = setInterval(() => {
      setShowMidroll(true);
      setTimeout(() => setShowMidroll(false), 15000);
    }, 15 * 60 * 1000);
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, [showPreroll, isPremium]);

  // Buffering detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, [showPreroll]);

  const switchQuality = (idx: number) => {
    setCurrentQuality(idx);
    if (hlsRef.current) hlsRef.current.currentLevel = idx;
  };

  const switchSource = (idx: number) => {
    setSourceIdx(idx);
    loadSource(idx);
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    localStorage.setItem("ls_volume", String(v));
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  const toggleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  if (showPreroll && !isPremium) {
    return (
      <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Advertisement</p>
          <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a] mb-4" data-ad-slot="preroll">
            <p className="text-white text-lg font-semibold mb-2">Upgrade to Premium</p>
            <p className="text-gray-400 text-sm">Premium display options can reduce interruptions where supported.</p>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Stream starts in <span className="text-white font-bold">{prerollCountdown}s</span>
          </p>
          {canSkip ? (
            <button
              onClick={() => setShowPreroll(false)}
              className="bg-[#E24B4A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#c43b3a] transition-colors"
            >
              Skip Ad →
            </button>
          ) : (
            <button
              onClick={() => setShowPreroll(false)}
              className="bg-[#333] text-gray-400 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
              disabled
            >
              Skip in {prerollCountdown - 10}s
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-12 h-12 border-4 border-[#E24B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showMidroll && !isPremium && (
        <div className="absolute bottom-16 left-0 right-0 mx-4 z-20">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 flex items-center justify-between" data-ad-slot="midroll">
            <span className="text-gray-400 text-xs">Advertisement</span>
            <span className="text-gray-300 text-sm">Upgrade to remove ads</span>
          </div>
        </div>
      )}

      {isLive && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#E24B4A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls={false}
        playsInline
      />

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
            className="text-white hover:text-[#E24B4A] transition-colors"
          >
            ▶
          </button>
          <button onClick={toggleMute} className="text-white hover:text-[#E24B4A] transition-colors text-sm">
            {muted ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => handleVolume(parseFloat(e.target.value))}
            className="w-20 accent-[#E24B4A]"
          />

          <div className="flex-1" />

          {/* Source switcher */}
          {sources.length > 1 && (
            <div className="flex gap-1">
              {sources.filter(Boolean).map((_, i) => (
                <button
                  key={i}
                  onClick={() => switchSource(i)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    sourceIdx === i ? "bg-[#E24B4A] text-white" : "bg-[#333] text-gray-300 hover:bg-[#444]"
                  }`}
                >
                  S{i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Quality selector */}
          {qualities.length > 0 && (
            <select
              value={currentQuality}
              onChange={(e) => switchQuality(Number(e.target.value))}
              className="bg-[#333] text-white text-xs rounded px-1 py-0.5 border-none outline-none"
            >
              {qualities.map((q) => (
                <option key={q.index} value={q.index}>
                  {q.label}
                </option>
              ))}
            </select>
          )}

          <button onClick={toggleFullscreen} className="text-white hover:text-[#E24B4A] transition-colors text-sm">
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}
