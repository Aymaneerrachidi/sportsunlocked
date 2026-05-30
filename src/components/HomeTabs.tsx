"use client";
import { useRouter } from "next/navigation";
import SportIcon from "@/components/SportIcon";

interface HomeTabsProps {
  sports: string[];
  active: string;
}

export default function HomeTabs({ sports, active }: HomeTabsProps) {
  const router = useRouter();
  return (
    <div style={{
      display: "flex",
      gap: 4,
      flexWrap: "wrap",
      padding: "2px 0",
    }}>
      {sports.map((sport) => {
        const isActive = active === sport;
        return (
          <button
            key={sport}
            onClick={() => router.push(sport === "All" ? "/" : `/?sport=${encodeURIComponent(sport)}`)}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: isActive ? 700 : 600,
              fontSize: 12,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: "var(--radius-sm)",
              border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: isActive ? "var(--accent-dim)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }
            }}
          >
            <SportIcon sport={sport} size={14} color="currentColor" />
            {sport}
          </button>
        );
      })}
    </div>
  );
}
