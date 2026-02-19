import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market";

interface UserRanking {
  userId: string;
  name: string;
  portfolioValue: number;
  costBasis: number;
  cashBalance: number;
  totalValue: number;
  returnPercent: number;
}

export async function calculateLeaderboard(): Promise<UserRanking[]> {
  const users = await prisma.user.findMany({
    include: { portfolioItems: true },
    where: { portfolioItems: { some: {} } },
  });

  // Collect all unique tickers
  const allTickers = [...new Set(users.flatMap((u) => u.portfolioItems.map((p) => p.tickerSymbol)))];

  // Batch-fetch prices
  const priceMap: Record<string, number> = {};
  for (const ticker of allTickers) {
    const quote = await getQuote(ticker);
    if (quote) priceMap[ticker] = quote.regularMarketPrice;
  }

  const rankings: UserRanking[] = users.map((user) => {
    const cashBalance = Number(user.virtualCashBalance);

    let portfolioValue = 0;
    let costBasis = 0;

    for (const item of user.portfolioItems) {
      const qty = Number(item.quantity);
      const avgCost = Number(item.averageCostBasis);
      const currentPrice = priceMap[item.tickerSymbol] ?? avgCost;

      portfolioValue += currentPrice * qty;
      costBasis += avgCost * qty;
    }

    const totalValue = cashBalance + portfolioValue;
    const initialBalance = Number(user.startingVirtualCashBalance ?? 1000);
    const returnPercent = initialBalance > 0 ? ((totalValue - initialBalance) / initialBalance) * 100 : 0;

    return {
      userId: user.id,
      name: user.name ?? "Anonymous",
      portfolioValue,
      costBasis,
      cashBalance,
      totalValue,
      returnPercent,
    };
  });

  // Also include users with no holdings (cash-only)
  const usersWithoutHoldings = await prisma.user.findMany({
    where: { portfolioItems: { none: {} } },
  });

  for (const user of usersWithoutHoldings) {
    const cashBalance = Number(user.virtualCashBalance);
    const initialBalance = Number(user.startingVirtualCashBalance ?? 1000);
    rankings.push({
      userId: user.id,
      name: user.name ?? "Anonymous",
      portfolioValue: 0,
      costBasis: 0,
      cashBalance,
      totalValue: cashBalance,
      returnPercent: initialBalance > 0 ? ((cashBalance - initialBalance) / initialBalance) * 100 : 0,
    });
  }

  rankings.sort((a, b) => b.returnPercent - a.returnPercent);
  return rankings;
}

export async function finalizeWeeklyContest() {
  const rankings = await calculateLeaderboard();

  if (rankings.length === 0) return;

  const winner = rankings[0];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4);
  weekEnd.setHours(16, 0, 0, 0);

  await prisma.contestHistory.create({
    data: {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      winnerUserId: winner.userId,
      winnerName: winner.name,
      winningProfitPercentage: parseFloat(winner.returnPercent.toFixed(2)),
      totalParticipants: rankings.length,
    },
  });
}
