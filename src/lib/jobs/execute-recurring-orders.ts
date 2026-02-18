import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market/yahoo";

export async function executeRecurringOrders() {
  const now = new Date();

  const dueOrders = await prisma.recurringOrder.findMany({
    where: { active: true, nextRunAt: { lte: now } },
  });

  for (const order of dueOrders) {
    try {
      const quote = await getQuote(order.tickerSymbol);
      if (!quote) continue;

      const pricePerShare = parseFloat(quote.regularMarketPrice.toFixed(2));
      const dollarAmount = Number(order.amount);
      const quantity = parseFloat((dollarAmount / pricePerShare).toFixed(8));
      const totalAmount = parseFloat((pricePerShare * quantity).toFixed(2));

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: order.userId },
          select: { virtualCashBalance: true },
        });

        if (Number(user.virtualCashBalance) < totalAmount) {
          // Not enough funds — skip but don't deactivate
          return;
        }

        await tx.user.update({
          where: { id: order.userId },
          data: { virtualCashBalance: { decrement: totalAmount } },
        });

        const existing = await tx.portfolioItem.findUnique({
          where: { userId_tickerSymbol: { userId: order.userId, tickerSymbol: order.tickerSymbol } },
        });

        if (existing) {
          const existingQty = Number(existing.quantity);
          const existingCost = Number(existing.averageCostBasis) * existingQty;
          const newQty = existingQty + quantity;
          const newAvg = (existingCost + totalAmount) / newQty;

          await tx.portfolioItem.update({
            where: { userId_tickerSymbol: { userId: order.userId, tickerSymbol: order.tickerSymbol } },
            data: { quantity: parseFloat(newQty.toFixed(8)), averageCostBasis: parseFloat(newAvg.toFixed(2)) },
          });
        } else {
          await tx.portfolioItem.create({
            data: {
              userId: order.userId,
              tickerSymbol: order.tickerSymbol,
              quantity,
              averageCostBasis: pricePerShare,
            },
          });
        }

        await tx.tradeTransaction.create({
          data: {
            userId: order.userId,
            tickerSymbol: order.tickerSymbol,
            type: "BUY",
            orderMode: "DOLLARS",
            orderType: "MARKET",
            quantity,
            pricePerShare,
            totalAmount,
          },
        });
      });

      // Compute next run
      const nextRunAt = computeNextRun(order.frequency, now);
      await prisma.recurringOrder.update({
        where: { id: order.id },
        data: { nextRunAt },
      });
    } catch (error) {
      console.error(`[recurring] Failed for order ${order.id}:`, error);
    }
  }
}

function computeNextRun(frequency: string, from: Date): Date {
  const next = new Date(from);
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  next.setHours(10, 0, 0, 0); // 10 AM
  return next;
}
