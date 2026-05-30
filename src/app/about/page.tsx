import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - SportUnlocked",
  description: "Learn about SportUnlocked and how the site helps sports fans organize schedules, start times, and live event discovery.",
};

export default function AboutPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">About Us</p>
      <h1>SportUnlocked</h1>
      <p>
        SportUnlocked is a sports discovery web app built for fans who want a fast way to browse live and upcoming
        events across football, basketball, tennis, combat sports, motor sports, cricket, rugby, and more. The site is
        designed as a schedule companion: it helps visitors compare events, filter by sport, check start times, and plan
        what to follow.
      </p>
      <p>
        Our goal is to organize event schedules, categories, start times, source availability, and viewing context into a
        clean interface that works well on desktop and mobile. We add original structure around event data, including
        sport filters, date grouping, multi-event tools, thumbnail handling, and practical guides for following busy
        sports calendars.
      </p>
      <h2>What We Provide</h2>
      <ul>
        <li>Live and upcoming sports event listings with start times and categories.</li>
        <li>Multi-day schedules grouped by date and sport.</li>
        <li>Multi-view tools for organizing more than one event on screen.</li>
        <li>Original guides, filtering, thumbnails, and user interface around public event data.</li>
      </ul>
      <h2>Editorial Note</h2>
      <p>
        SportUnlocked does not claim ownership of third-party event names, team names, logos, or broadcast content.
        We do not host video files. If you represent a rights holder and need to contact us, please use the contact
        page.
      </p>
    </main>
  );
}
