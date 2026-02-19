import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getQuote } from "@/lib/market";

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    );
  }

  const quote = await getQuote(symbol);

  if (!quote) {
    return NextResponse.json(
      { error: `Could not find quote for "${symbol}"` },
      { status: 404 }
    );
  }

  return NextResponse.json({ quote });
}
