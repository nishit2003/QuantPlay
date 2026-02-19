import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getQuotes } from "@/lib/market";
import { apiRateLimit } from "@/lib/rate-limit";

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const rl = apiRateLimit(getClientKey(request));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols required (comma-separated)" }, { status: 400 });
  }
  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
  if (symbols.length === 0) {
    return NextResponse.json({ quotes: {} });
  }
  try {
    const quotes = await getQuotes(symbols);
    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
