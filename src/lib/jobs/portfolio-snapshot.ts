import { prisma } from "@/lib/prisma";
import { getQuotes } from "@/lib/market";

/** Snapshot each user's portfolio value for "performance over time" chart. Run daily. */
export async function runPortfolioSnapshots() {
  const users = await prisma.user.findMany({
    include: { portfolioItems: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allTickers = [
    ...new Set(users.flatMap((u) => u.portfolioItems.map((p) => p.tickerSymbol))),
  ];

  const quotes = allTickers.length > 0 ? await getQuotes(allTickers) : {};

  for (const user of users) {
    const cash = Number(user.virtualCashBalance);
    let holdingsValue = 0;
    for (const item of user.portfolioItems) {
      const q = quotes[item.tickerSymbol];
      if (!q) continue;
      holdingsValue += q.regularMarketPrice * Number(item.quantity);
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
