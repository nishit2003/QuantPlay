import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market";

export async function GET() {
  try {
    await prisma.priceAlert.updateMany({
      where: { tickerSymbol: "INTC" },
      data: { triggered: false }
    });

    const alerts = await prisma.priceAlert.findMany({
      where: { tickerSymbol: "INTC" },
      include: { user: { select: { email: true } } }
    });

    const quote = await getQuote("INTC");

    return NextResponse.json({
      alerts,
      currentPrice: quote?.regularMarketPrice,
      quoteData: quote
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
