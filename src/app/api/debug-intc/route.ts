import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market";

export async function GET() {
  try {
    await prisma.priceAlert.updateMany({
      where: { tickerSymbol: "NVDA" },
      data: { triggered: false }
    });

    const alerts = await prisma.priceAlert.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" }
    });

    const quote = await getQuote("NVDA");

    return NextResponse.json({ alerts, quote });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
