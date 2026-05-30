import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>SportUnlocked</strong>
        <span>Sports schedules, live event discovery, and stream availability in one place.</span>
      </div>
      <nav aria-label="Footer navigation">
        {LINKS.map(link => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>
    </footer>
  );
}
