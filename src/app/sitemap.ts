import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportunlocked.com";
const lastModified = new Date("2026-05-30");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/schedule",
    "/guides",
    "/multiview",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/editorial-policy",
  ];

  return [
    ...staticRoutes.map(path => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: path === "" || path === "/schedule" ? "hourly" as const : "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...GUIDES.map(guide => ({
      url: `${siteUrl}/guides/${guide.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
