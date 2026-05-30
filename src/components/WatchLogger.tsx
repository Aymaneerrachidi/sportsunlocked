"use client";
import { useEffect } from "react";

export default function WatchLogger({ matchId }: { matchId: string }) {
  useEffect(() => {
    // Log after 10 seconds of watching (not just opening the page)
    const t = setTimeout(() => {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      }).catch(() => {});
    }, 10_000);
    return () => clearTimeout(t);
  }, [matchId]);

  return null;
}
