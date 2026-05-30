import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guideBySlug } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map(guide => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  return {
    title: guide ? `${guide.title} - SportUnlocked` : "Guide - SportUnlocked",
    description: guide?.excerpt ?? "SportUnlocked sports guide.",
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);

  if (!guide) {
    return (
      <main className="legal-page">
        <h1>Guide Not Found</h1>
        <p>The guide you are looking for is not available.</p>
        <p><Link href="/guides">Back to guides</Link></p>
      </main>
    );
  }

  return (
    <main className="legal-page">
      <p className="schedule-eyebrow">{guide.minutes} Min Read</p>
      <h1>{guide.title}</h1>
      <p>{guide.excerpt}</p>

      {guide.sections.map(section => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}

      <p className="guide-back"><Link href="/guides">Back to all guides</Link></p>
    </main>
  );
}
