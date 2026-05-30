import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");
  const bypassCache = req.nextUrl.searchParams.has("t");
  const isLive = path === "live" || path === "live/popular";
  const revalidate = isLive ? 0 : 120;

  try {
    const res = await fetch(`https://streamed.pk/api/matches/${path}`, {
      ...(isLive || bypassCache ? { cache: "no-store" as const } : { next: { revalidate } }),
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": isLive
          || bypassCache
          ? "no-store, no-cache, must-revalidate"
          : `public, s-maxage=${revalidate}, stale-while-revalidate=60`,
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
