import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - SportUnlocked",
  description: "Learn about SportUnlocked and how the site helps sports fans discover live and upcoming events.",
};

export default function AboutPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">About Us</p>
      <h1>SportUnlocked</h1>
      <p>
        SportUnlocked is a sports discovery web app built for fans who want a fast way to browse live and upcoming
        events across football, basketball, tennis, combat sports, motor sports, cricket, rugby, and more.
      </p>
      <p>
        Our goal is to organize event schedules, categories, start times, and stream availability into a clean interface
        that works well on desktop and mobile. The site focuses on helping visitors find what is on now, what is coming
        up next, and which events have available sources.
      </p>
      <h2>What We Provide</h2>
      <ul>
        <li>Live and upcoming sports event listings.</li>
        <li>Multi-day schedules grouped by date and sport.</li>
        <li>Multi-view tools for following more than one event.</li>
        <li>Original organization, filtering, thumbnails, and user interface around public event data.</li>
      </ul>
      <h2>Editorial Note</h2>
      <p>
        SportUnlocked does not claim ownership of third-party event names, team names, logos, or broadcast content.
        If you represent a rights holder and need to contact us, please use the contact page.
      </p>
    </main>
  );
}
