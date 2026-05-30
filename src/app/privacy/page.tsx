import type { Metadata } from "next";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@sportunlocked.example";

export const metadata: Metadata = {
  title: "Privacy Policy - SportUnlocked",
  description: "SportUnlocked privacy policy covering analytics, advertising, cookies, and contact information.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">Privacy Policy</p>
      <h1>Privacy Policy</h1>
      <p>Last updated: May 30, 2026</p>

      <h2>Information We Collect</h2>
      <p>
        SportUnlocked may collect basic technical information such as page views, device type, browser type, referring
        pages, approximate location, and performance metrics. This helps us understand site usage and improve the user
        experience.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Analytics to measure traffic and page views. Analytics data is used in aggregate to understand
        which pages are visited and how the site performs.
      </p>

      <h2>Advertising</h2>
      <p>
        If advertising is enabled, third-party advertising partners such as Google AdSense may use cookies or similar
        technologies to serve and measure ads. These partners may personalize or limit ads based on their policies and
        your settings.
      </p>
      <p>
        Advertising partners may receive technical signals such as your browser, device, approximate location, page URL,
        and interactions with ads. You can manage personalized advertising through your Google ad settings and browser
        privacy controls.
      </p>

      <h2>Cookies</h2>
      <p>
        Cookies may be used for analytics, advertising, security, and normal site functionality. You can control cookies
        through your browser settings.
      </p>

      <h2>Third-Party Content</h2>
      <p>
        Some pages may include third-party embedded content or links related to event availability. Third-party services
        may process information under their own privacy policies. SportUnlocked does not control the cookies, ads, or
        tracking technologies used by third-party embedded services.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </main>
  );
}
