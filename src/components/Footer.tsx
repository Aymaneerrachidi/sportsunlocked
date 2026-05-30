import Link from "next/link";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>SportUnlocked</strong>
        <span>Sports schedules, event discovery, original guides, and viewing tools in one place.</span>
      </div>
      <nav aria-label="Footer navigation">
        {LINKS.map(link => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>
    </footer>
  );
}
