"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/multiview", label: "Multi-View" },
  { href: "/premium", label: "Premium" },
];

type SessionUser = {
  name?: string | null;
  email?: string | null;
  isPremium?: boolean;
  isAdmin?: boolean;
};

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const user = session?.user as SessionUser | undefined;

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
        justifyContent: "space-between",
        gap: 24,
      }}>

        <div style={{ flexShrink: 0 }}>
          <BrandLogo size="sm" collapseOnMobile />
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
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
                transition: "color 0.15s",
                position: "relative",
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >
                {label}
                {active && (
                  <span style={{
                    position: "absolute",
                    bottom: -1,
                    left: 12,
                    right: 12,
                    height: 2,
                    background: "var(--accent)",
                    borderRadius: 1,
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {session ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOpen(!open)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "5px 10px 5px 5px",
                  cursor: "pointer",
                  color: "var(--text)",
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 13,
                  color: "#060A12",
                  textTransform: "uppercase",
                }}>
                  {user?.name?.[0] ?? user?.email?.[0] ?? "U"}
                </div>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  color: "var(--text-muted)",
                  maxWidth: 100,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {user?.name ?? user?.email?.split("@")[0]}
                </span>
                {user?.isPremium && (
                  <span style={{
                    background: "var(--accent)",
                    color: "#060A12",
                    fontSize: 9,
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.08em",
                    padding: "1px 5px",
                    borderRadius: 3,
                    textTransform: "uppercase",
                  }}>PRO</span>
                )}
              </button>
              {open && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: 4,
                  minWidth: 160,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  zIndex: 100,
                }}>
                  {user?.isAdmin && (
                    <Link href="/admin" onClick={() => setOpen(false)} style={{
                      display: "block",
                      padding: "7px 12px",
                      fontFamily: "var(--font-display)",
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      borderRadius: "var(--radius-sm)",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                    >Admin Panel</Link>
                  )}
                  <button onClick={() => signOut()} style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 12px",
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: "var(--text-muted)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "var(--radius-sm)",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.color = "var(--live)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                  >Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                textDecoration: "none",
                padding: "6px 12px",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >Sign In</Link>
              <Link href="/register" style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: "var(--accent)",
                color: "#060A12",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                transition: "opacity 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >Join Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
