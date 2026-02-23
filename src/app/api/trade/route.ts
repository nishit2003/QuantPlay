import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market";
import { tradeSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const userId = session.user.id;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = tradeSchema.safeParse(rawBody);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { symbol, type, mode, quantity, dollarAmount } = parsed.data;

  const ticker = symbol.toUpperCase();
  const quote = await getQuote(ticker);
  if (!quote) {
    return NextResponse.json({ error: `Could not fetch price for ${ticker}` }, { status: 404 });
  }

  const pricePerShare = parseFloat(quote.regularMarketPrice.toFixed(2));

  let tradeQuantity: number;
  let totalAmount: number;

  if (mode === "DOLLARS") {
    totalAmount = parseFloat(dollarAmount!.toFixed(2));
    tradeQuantity = parseFloat((totalAmount / pricePerShare).toFixed(8));
  } else {
    tradeQuantity = parseFloat(Number(quantity!).toFixed(8));
    totalAmount = parseFloat((pricePerShare * tradeQuantity).toFixed(2));
  }

  if (tradeQuantity <= 0) {
    return NextResponse.json({ error: "Trade quantity too small" }, { status: 400 });
  }

  const orderMode = mode === "DOLLARS" ? "DOLLARS" : "SHARES";

  try {
    if (type === "BUY") {
      return await executeBuy(userId, ticker, tradeQuantity, pricePerShare, totalAmount, orderMode);
    } else {
      return await executeSell(userId, ticker, tradeQuantity, pricePerShare, totalAmount, orderMode);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trade execution failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function executeBuy(
  userId: string,
  ticker: string,
  quantity: number,
  pricePerShare: number,
  totalAmount: number,
  orderMode: "SHARES" | "DOLLARS"
) {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { virtualCashBalance: true },
    });

    const balance = Number(user.virtualCashBalance);
    if (balance < totalAmount) {
      throw new Error(
        `Insufficient funds. You have $${balance.toFixed(2)} but need $${totalAmount.toFixed(2)}.`
      );
    }

    await tx.user.update({
      where: { id: userId },
      data: { virtualCashBalance: { decrement: totalAmount } },
    });

    const existingPosition = await tx.portfolioItem.findUnique({
      where: { userId_tickerSymbol: { userId, tickerSymbol: ticker } },
    });

    if (existingPosition) {
      const existingQty = Number(existingPosition.quantity);
      const existingCost = Number(existingPosition.averageCostBasis) * existingQty;
      const newTotalCost = existingCost + totalAmount;
      const newQuantity = existingQty + quantity;
      const newAvgCost = newTotalCost / newQuantity;

      await tx.portfolioItem.update({
        where: { userId_tickerSymbol: { userId, tickerSymbol: ticker } },
        data: {
          quantity: parseFloat(newQuantity.toFixed(8)),
          averageCostBasis: parseFloat(newAvgCost.toFixed(2)),
        },
      });
    } else {
      await tx.portfolioItem.create({
        data: {
          userId,
          tickerSymbol: ticker,
          quantity: parseFloat(quantity.toFixed(8)),
          averageCostBasis: pricePerShare,
        },
      });
    }

    const trade = await tx.tradeTransaction.create({
      data: {
        userId,
        tickerSymbol: ticker,
        type: "BUY",
        orderMode,
        orderType: "MARKET",
        quantity: parseFloat(quantity.toFixed(8)),
        pricePerShare,
        totalAmount,
      },
    });

    return trade;
  });

  const qtyStr = quantity >= 1 ? quantity.toFixed(2) : quantity.toFixed(8);
  return NextResponse.json({
    message: `Bought ${qtyStr} share(s) of ${ticker} at $${pricePerShare.toFixed(2)}`,
    trade: result,
  });
}

async function executeSell(
  userId: string,
  ticker: string,
  quantity: number,
  pricePerShare: number,
  totalAmount: number,
  orderMode: "SHARES" | "DOLLARS"
) {
  const result = await prisma.$transaction(async (tx) => {
    const position = await tx.portfolioItem.findUnique({
      where: { userId_tickerSymbol: { userId, tickerSymbol: ticker } },
    });

    const owned = position ? Number(position.quantity) : 0;
    if (owned < quantity) {
      throw new Error(
        `Insufficient shares. You own ${owned.toFixed(8)} share(s) of ${ticker} but tried to sell ${quantity.toFixed(8)}.`
      );
    }

    await tx.user.update({
      where: { id: userId },
      data: { virtualCashBalance: { increment: totalAmount } },
    });

    const remainingQuantity = parseFloat((owned - quantity).toFixed(8));

    if (remainingQuantity <= 0.000000001) {
      await tx.portfolioItem.delete({
        where: { userId_tickerSymbol: { userId, tickerSymbol: ticker } },
      });
    } else {
      await tx.portfolioItem.update({
        where: { userId_tickerSymbol: { userId, tickerSymbol: ticker } },
        data: { quantity: remainingQuantity },
      });
    }

    const trade = await tx.tradeTransaction.create({
      data: {
        userId,
        tickerSymbol: ticker,
        type: "SELL",
        orderMode,
        orderType: "MARKET",
        quantity: parseFloat(quantity.toFixed(8)),
        pricePerShare,
        totalAmount,
      },
    });

    return trade;
  });

  const qtyStr = quantity >= 1 ? quantity.toFixed(2) : quantity.toFixed(8);
  return NextResponse.json({
    message: `Sold ${qtyStr} share(s) of ${ticker} at $${pricePerShare.toFixed(2)}`,
    trade: result,
  });
}
