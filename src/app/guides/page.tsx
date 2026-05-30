import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Sports Guides - SportUnlocked",
  description: "Original guides for following live sports schedules, time zones, and multi-event viewing.",
};

export default function GuidesPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">Guides</p>
      <h1>Sports Viewing Guides</h1>
      <p>
        Original practical guides for planning a busy sports day, reading international schedules, and organizing more
        than one event without turning your screen into noise.
      </p>

      <div className="guide-grid">
        {GUIDES.map(guide => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="guide-card">
            <span>{guide.minutes} min read</span>
            <h2>{guide.title}</h2>
            <p>{guide.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
