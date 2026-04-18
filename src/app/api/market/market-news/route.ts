import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getStockNews } from "@/lib/market";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  try {
    // Fetch news from multiple major tickers for a broad market view
    const symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"];
    const allNews = await Promise.all(symbols.map((s) => getStockNews(s)));
    
    // Flatten, deduplicate by title, sort by date
    const seen = new Set<string>();
    const news = allNews.flat()
      .filter((n) => {
        if (seen.has(n.title)) return false;
        seen.add(n.title);
        return true;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 20);

    return NextResponse.json({ news });
  } catch (error) {
    console.error("Market news error:", error);
    return NextResponse.json({ news: [] });
  }
}
