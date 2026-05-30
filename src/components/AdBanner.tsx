"use client";
import { useEffect } from "react";

interface AdBannerProps {
  type: "banner" | "sidebar" | "preroll";
  matchId?: string;
  className?: string;
}

export default function AdBanner({ type, matchId }: AdBannerProps) {
  useEffect(() => {
    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, matchId }),
    }).catch(() => {});
  }, [type, matchId]);

  if (type === "sidebar") {
    return (
      <div
        data-ad-slot={`sidebar-${matchId}`}
        style={{
          width: 300, height: 250,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 11, fontFamily: "var(--font-display)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)" }}>Advertisement</span>
        <span style={{ fontSize: 10, color: "var(--text-dim)" }}>300×250</span>
      </div>
    );
  }

  return (
    <div
      data-ad-slot={`banner-${matchId}`}
      style={{
        width: "100%", height: 60,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, fontFamily: "var(--font-display)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)" }}>Advertisement</span>
    </div>
  );
}
