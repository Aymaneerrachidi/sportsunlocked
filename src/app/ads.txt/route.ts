export const dynamic = "force-dynamic";

export function GET() {
  const rawId = process.env.ADSENSE_PUBLISHER_ID ?? process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
  const publisherId = rawId.replace(/^ca-/, "").trim();

  if (!publisherId) {
    return new Response("# Add ADSENSE_PUBLISHER_ID=pub-0000000000000000 to enable ads.txt\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
