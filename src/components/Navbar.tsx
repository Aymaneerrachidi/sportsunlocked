"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

const NAV_LINKS = [
  { href: "/", label: "Live" },
  { href: "/schedule", label: "Schedule" },
  { href: "/multiview", label: "Multi-View" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "rgba(6,10,18,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}>
        <div style={{ flexShrink: 0, transform: "translateY(6px)" }}>
          <BrandLogo size="sm" collapseOnMobile />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "var(--accent)" : "var(--text-muted)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                position: "relative",
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >
                {label}
                {active && (
                  <span style={{
                    position: "absolute", bottom: -1, left: 12, right: 12,
                    height: 2, background: "var(--accent)", borderRadius: 1,
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
