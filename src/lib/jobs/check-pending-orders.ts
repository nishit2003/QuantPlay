import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market/yahoo";

export async function checkPendingOrders() {
  const pendingOrders = await prisma.pendingOrder.findMany({
    where: { status: "PENDING" },
  });

  if (pendingOrders.length === 0) return;

  // Expire old orders
  const now = new Date();
  const expired = pendingOrders.filter((o) => o.expiresAt && o.expiresAt < now);
  for (const o of expired) {
    await prisma.pendingOrder.update({
      where: { id: o.id },
      data: { status: "EXPIRED" },
    });
  }

  const active = pendingOrders.filter((o) => !o.expiresAt || o.expiresAt >= now);
  if (active.length === 0) return;

  // Batch-fetch unique tickers
  const tickers = [...new Set(active.map((o) => o.tickerSymbol))];
  const priceMap: Record<string, number> = {};

  for (const ticker of tickers) {
    const quote = await getQuote(ticker);
    if (quote) priceMap[ticker] = quote.regularMarketPrice;
  }

  for (const order of active) {
    const currentPrice = priceMap[order.tickerSymbol];
    if (!currentPrice) continue;

    const target = Number(order.targetPrice);
    let shouldExecute = false;

    if (order.orderType === "LIMIT" && order.type === "BUY") {
      shouldExecute = currentPrice <= target;
    } else if (order.orderType === "LIMIT" && order.type === "SELL") {
      shouldExecute = currentPrice >= target;
    } else if (order.orderType === "STOP_LOSS") {
      shouldExecute = currentPrice <= target;
    }

    if (!shouldExecute) continue;

    try {
      await executeOrder(order, currentPrice);
    } catch (error) {
      console.error(`Failed to execute order ${order.id}:`, error);
    }
  }
}

async function executeOrder(
  order: {
    id: string;
    userId: string;
    tickerSymbol: string;
    type: "BUY" | "SELL";
    orderMode: string;
    quantity: unknown;
    dollarAmount: unknown;
  },
  pricePerShare: number
) {
  let tradeQuantity: number;
  let totalAmount: number;

  if (order.orderMode === "DOLLARS") {
    totalAmount = parseFloat(Number(order.dollarAmount).toFixed(2));
    tradeQuantity = parseFloat((totalAmount / pricePerShare).toFixed(8));
  } else {
    tradeQuantity = parseFloat(Number(order.quantity).toFixed(8));
    totalAmount = parseFloat((pricePerShare * tradeQuantity).toFixed(2));
  }

  await prisma.$transaction(async (tx) => {
    if (order.type === "BUY") {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: order.userId },
        select: { virtualCashBalance: true },
      });

      if (Number(user.virtualCashBalance) < totalAmount) {
        await tx.pendingOrder.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });
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
        const newQty = existingQty + tradeQuantity;
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
            quantity: tradeQuantity,
            averageCostBasis: pricePerShare,
          },
        });
      }
    } else {
      const position = await tx.portfolioItem.findUnique({
        where: { userId_tickerSymbol: { userId: order.userId, tickerSymbol: order.tickerSymbol } },
      });

      const owned = position ? Number(position.quantity) : 0;
      if (owned < tradeQuantity) {
        await tx.pendingOrder.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
        return;
      }

      await tx.user.update({
        where: { id: order.userId },
        data: { virtualCashBalance: { increment: totalAmount } },
      });

      const remaining = parseFloat((owned - tradeQuantity).toFixed(8));
      if (remaining <= 0.000000001) {
        await tx.portfolioItem.delete({
          where: { userId_tickerSymbol: { userId: order.userId, tickerSymbol: order.tickerSymbol } },
        });
      } else {
        await tx.portfolioItem.update({
          where: { userId_tickerSymbol: { userId: order.userId, tickerSymbol: order.tickerSymbol } },
          data: { quantity: remaining },
        });
      }
    }

    await tx.tradeTransaction.create({
      data: {
        userId: order.userId,
        tickerSymbol: order.tickerSymbol,
        type: order.type,
        orderMode: order.orderMode === "DOLLARS" ? "DOLLARS" : "SHARES",
        orderType: "LIMIT",
        quantity: tradeQuantity,
        pricePerShare,
        totalAmount,
      },
    });

    await tx.pendingOrder.update({
      where: { id: order.id },
      data: { status: "EXECUTED" },
    });
  });
}
