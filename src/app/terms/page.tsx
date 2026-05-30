import type { Metadata } from "next";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@sportunlocked.example";

export const metadata: Metadata = {
  title: "Terms - SportUnlocked",
  description: "Terms of use for SportUnlocked.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">Terms</p>
      <h1>Terms Of Use</h1>
      <p>Last updated: May 30, 2026</p>

      <h2>Use Of The Site</h2>
      <p>
        SportUnlocked is provided for sports event discovery, schedule browsing, and availability information. You agree
        to use the site lawfully and responsibly.
      </p>

      <h2>Third-Party Sources</h2>
      <p>
        The site may link to or embed third-party sources. SportUnlocked does not control third-party services and is not
        responsible for their availability, content, advertising, or behavior.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        Team names, league names, event names, logos, and broadcast materials belong to their respective owners. If you
        believe content on this site infringes your rights, contact us with the relevant page URL and details.
      </p>

      <h2>Contact</h2>
      <p>
        For terms or copyright questions, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </main>
  );
}
