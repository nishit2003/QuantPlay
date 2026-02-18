import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "30", 10)));

  const trades = await prisma.tradeTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json({
    trades: trades.map((t) => ({
      id: t.id,
      tickerSymbol: t.tickerSymbol,
      type: t.type,
      orderType: t.orderType,
      orderMode: t.orderMode,
      quantity: t.quantity.toString(),
      pricePerShare: t.pricePerShare.toString(),
      totalAmount: t.totalAmount.toString(),
      timestamp: t.timestamp.toISOString(),
    })),
  });
}
