import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/market/yahoo";

export async function GET(request: Request) {
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
