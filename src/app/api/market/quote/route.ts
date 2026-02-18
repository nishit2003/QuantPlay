import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuote } from "@/lib/market/yahoo";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
