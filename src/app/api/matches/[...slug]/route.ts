import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");
  const revalidate = path === "live" ? 30 : 120;

  try {
    const res = await fetch(`https://streamed.pk/api/matches/${path}`, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return NextResponse.json([], { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=60` },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
