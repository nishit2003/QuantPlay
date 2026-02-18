import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchSymbols } from "@/lib/market/yahoo";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchSymbols(query);
  return NextResponse.json({ results });
}
