import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.session.user.id;

  const trades = await prisma.tradeTransaction.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
  });

  // Group trades by ticker to compute P&L per ticker
  const byTicker: Record<string, { buys: typeof trades; sells: typeof trades }> = {};
  for (const t of trades) {
    if (!byTicker[t.tickerSymbol]) byTicker[t.tickerSymbol] = { buys: [], sells: [] };
    if (t.type === "BUY") byTicker[t.tickerSymbol].buys.push(t);
    else byTicker[t.tickerSymbol].sells.push(t);
  }

  // Compute stats
  let totalBuyAmount = 0;
  let totalSellAmount = 0;
  let totalTrades = trades.length;
  let buyCount = 0;
  let sellCount = 0;

  const sectorCount: Record<string, number> = {};
  const tickerStats: { ticker: string; trades: number; totalBought: number; totalSold: number; netPnL: number }[] = [];

  for (const [ticker, { buys, sells }] of Object.entries(byTicker)) {
    const boughtTotal = buys.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const soldTotal = sells.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    totalBuyAmount += boughtTotal;
    totalSellAmount += soldTotal;
    buyCount += buys.length;
    sellCount += sells.length;

    tickerStats.push({
      ticker,
      trades: buys.length + sells.length,
      totalBought: boughtTotal,
      totalSold: soldTotal,
      netPnL: soldTotal - boughtTotal, // simplified P&L
    });

    // Count sector (approximate)
    const sector = guessSector(ticker);
    sectorCount[sector] = (sectorCount[sector] ?? 0) + buys.length + sells.length;
  }

  // Chronological equity curve (cumulative P&L proxy)
  const equityCurve: { date: string; value: number }[] = [];
  let cumulative = 0;
  const sortedTrades = [...trades].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  for (const t of sortedTrades) {
    const amount = Number(t.totalAmount);
    cumulative += t.type === "SELL" ? amount : -amount;
    equityCurve.push({
      date: t.timestamp.toISOString(),
      value: parseFloat(cumulative.toFixed(2)),
    });
  }

  // Recent trades serialized
  const recentTrades = trades.slice(0, 50).map((t) => ({
    id: t.id,
    ticker: t.tickerSymbol,
    type: t.type,
    orderType: t.orderType,
    quantity: Number(t.quantity),
    price: Number(t.pricePerShare),
    total: Number(t.totalAmount),
    date: t.timestamp.toISOString(),
  }));

  // Sector allocation
  const sectors = Object.entries(sectorCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Top traded tickers
  const topTickers = tickerStats.sort((a, b) => b.trades - a.trades).slice(0, 10);

  return NextResponse.json({
    totalTrades,
    buyCount,
    sellCount,
    totalBuyAmount: parseFloat(totalBuyAmount.toFixed(2)),
    totalSellAmount: parseFloat(totalSellAmount.toFixed(2)),
    netPnL: parseFloat((totalSellAmount - totalBuyAmount).toFixed(2)),
    equityCurve,
    recentTrades,
    sectors,
    topTickers,
  });
}

function guessSector(ticker: string): string {
  const map: Record<string, string> = {
    AAPL:"Tech",MSFT:"Tech",GOOGL:"Tech",AMZN:"Tech",NVDA:"Tech",META:"Tech",TSLA:"Tech",AMD:"Tech",INTC:"Tech",NFLX:"Tech",ADBE:"Tech",CRM:"Tech",
    JPM:"Finance",V:"Finance",MA:"Finance",GS:"Finance",BAC:"Finance",
    UNH:"Healthcare",JNJ:"Healthcare",LLY:"Healthcare",PFE:"Healthcare",MRK:"Healthcare",ABBV:"Healthcare",
    WMT:"Consumer",PG:"Consumer",KO:"Consumer",PEP:"Consumer",NKE:"Consumer",SBUX:"Consumer",DIS:"Consumer",MCD:"Consumer",COST:"Consumer",HD:"Consumer",
    XOM:"Energy",CVX:"Energy",BA:"Industrial",CAT:"Industrial",
    SQ:"Fintech",PYPL:"Fintech",COIN:"Fintech",SOFI:"Fintech",PLTR:"Fintech",UBER:"Fintech",
    SPY:"ETF",QQQ:"ETF",
  };
  return map[ticker] ?? "Other";
}
