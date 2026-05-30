import type { Metadata } from "next";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@sportunlocked.example";

export const metadata: Metadata = {
  title: "Editorial Policy - SportUnlocked",
  description: "How SportUnlocked organizes sports schedules, guides, thumbnails, and third-party event information.",
};

export default function EditorialPolicyPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">Editorial Policy</p>
      <h1>Editorial Policy</h1>
      <p>
        SportUnlocked is built as a schedule-first sports companion. Our pages organize public event information,
        categories, start times, thumbnails, and practical guides so visitors can understand what is happening today
        and plan which events to follow.
      </p>

      <h2>How We Organize Information</h2>
      <p>
        We group events by sport, date, status, and source availability. We also create original guide content that
        explains schedule planning, time zones, multi-event layouts, and ways to compare overlapping sports events.
      </p>

      <h2>Accuracy And Updates</h2>
      <p>
        Sports schedules can change because of delays, postponements, tournament order, weather, or provider updates.
        We refresh live information regularly, but visitors should check official league, team, or event organizer
        pages when exact timing is important.
      </p>

      <h2>Images And Names</h2>
      <p>
        Event names, team names, league names, logos, and images belong to their respective owners. Thumbnails are used
        to help identify events and may come from public or third-party data sources. If an image is wrong or should be
        reviewed, contact us with the page URL.
      </p>

      <h2>Third-Party Sources</h2>
      <p>
        Some pages may reference third-party availability or embedded providers. SportUnlocked does not create, host,
        upload, or sell sports broadcasts. Third-party services are responsible for their own content, ads, cookies,
        and availability.
      </p>

      <h2>Corrections</h2>
      <p>
        For corrections, rights-holder requests, or feedback about schedules and thumbnails, email{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </main>
  );
}
