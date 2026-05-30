import type { Metadata } from "next";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@sportunlocked.example";

export const metadata: Metadata = {
  title: "Contact - SportUnlocked",
  description: "Contact SportUnlocked for feedback, corrections, copyright questions, support, or business inquiries.",
};

export default function ContactPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">Contact</p>
      <h1>Get In Touch</h1>
      <p>
        For feedback, corrections, support, partnership questions, copyright concerns, or site issues, contact the
        SportUnlocked team by email.
      </p>
      <div className="contact-panel">
        <span>Email</span>
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </div>
      <h2>Copyright Or Rights Holder Requests</h2>
      <p>
        Please include the event name, page URL, your organization, and enough detail for us to review your request.
        We aim to review legitimate rights holder messages promptly.
      </p>
      <h2>Site Feedback</h2>
      <p>
        If a schedule entry, thumbnail, category, start time, or availability signal is incorrect, send us the page URL
        and a short description of the issue.
      </p>
    </main>
  );
}
