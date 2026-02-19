/**
 * Simplified dividends: once per month, credit each user a small % of their
 * total holdings value as "dividend" into cash. Purely illustrative for paper trading.
 */
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market";

const DIVIDEND_RATE = 0.001; // 0.1% of position value per month

export async function runDividends() {
  const users = await prisma.user.findMany({
    include: { portfolioItems: true },
  });

  for (const user of users) {
    if (user.portfolioItems.length === 0) continue;

    const tickers = [...new Set(user.portfolioItems.map((p) => p.tickerSymbol))];
    let totalValue = 0;
    for (const t of tickers) {
      const q = await getQuote(t);
      if (!q) continue;
      const items = user.portfolioItems.filter((p) => p.tickerSymbol === t);
      const qty = items.reduce((s, i) => s + Number(i.quantity), 0);
      totalValue += q.regularMarketPrice * qty;
    }

    const dividend = parseFloat((totalValue * DIVIDEND_RATE).toFixed(2));
    if (dividend <= 0) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: { virtualCashBalance: { increment: dividend } },
    });
  }
}
