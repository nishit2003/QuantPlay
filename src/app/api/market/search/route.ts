import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { searchSymbols } from "@/lib/market";

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchSymbols(query);
  return NextResponse.json({ results });
}
