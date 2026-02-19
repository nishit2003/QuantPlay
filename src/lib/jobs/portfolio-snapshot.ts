import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market/yahoo";

/** Snapshot each user's portfolio value for "performance over time" chart. Run daily. */
export async function runPortfolioSnapshots() {
  const users = await prisma.user.findMany({
    include: { portfolioItems: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const user of users) {
    const cash = Number(user.virtualCashBalance);
    let holdingsValue = 0;
    const tickers = [...new Set(user.portfolioItems.map((p) => p.tickerSymbol))];
    for (const t of tickers) {
      const q = await getQuote(t);
      if (!q) continue;
      const items = user.portfolioItems.filter((p) => p.tickerSymbol === t);
      const qty = items.reduce((s, i) => s + Number(i.quantity), 0);
      holdingsValue += q.regularMarketPrice * qty;
    }
    const value = cash + holdingsValue;

    await prisma.portfolioSnapshot.upsert({
      where: {
        userId_date: { userId: user.id, date: today },
      },
      create: { userId: user.id, date: today, value },
      update: { value },
    });
  }
}
