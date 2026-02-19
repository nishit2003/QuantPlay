import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getMarketDiscovery } from "@/lib/market/yahoo";

let cache: { data: Awaited<ReturnType<typeof getMarketDiscovery>>; ts: number } | null = null;
const TTL = 60_000; // 1-minute cache

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  try {
    if (cache && Date.now() - cache.ts < TTL) {
      return NextResponse.json(cache.data);
    }
    const data = await getMarketDiscovery();
    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
