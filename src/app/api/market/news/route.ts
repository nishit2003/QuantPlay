import { NextRequest, NextResponse } from "next/server";
import { getStockNews } from "@/lib/market/yahoo";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const news = await getStockNews(symbol);
  return NextResponse.json({ news });
}
