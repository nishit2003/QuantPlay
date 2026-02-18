import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.pendingOrder.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    symbol: string;
    type: "BUY" | "SELL";
    orderType: "LIMIT" | "STOP_LOSS";
    targetPrice: number;
    mode?: "SHARES" | "DOLLARS";
    quantity?: number;
    dollarAmount?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { symbol, type, orderType, targetPrice, mode = "SHARES", quantity, dollarAmount } = body;

  if (!symbol || !type || !orderType || !targetPrice) {
    return NextResponse.json({ error: "symbol, type, orderType, and targetPrice are required" }, { status: 400 });
  }

  if (targetPrice <= 0) {
    return NextResponse.json({ error: "Target price must be positive" }, { status: 400 });
  }

  if (mode === "SHARES" && (!quantity || quantity <= 0)) {
    return NextResponse.json({ error: "Quantity must be positive" }, { status: 400 });
  }

  if (mode === "DOLLARS" && (!dollarAmount || dollarAmount <= 0)) {
    return NextResponse.json({ error: "Dollar amount must be positive" }, { status: 400 });
  }

  const order = await prisma.pendingOrder.create({
    data: {
      userId: session.user.id,
      tickerSymbol: symbol.toUpperCase(),
      type,
      orderType,
      targetPrice,
      quantity: mode === "SHARES" ? parseFloat(Number(quantity!).toFixed(8)) : null,
      dollarAmount: mode === "DOLLARS" ? parseFloat(Number(dollarAmount!).toFixed(2)) : null,
      orderMode: mode,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90-day expiry
    },
  });

  return NextResponse.json({ message: "Order placed", order }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "Order id is required" }, { status: 400 });
  }

  const order = await prisma.pendingOrder.findUnique({ where: { id: orderId } });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 });
  }

  await prisma.pendingOrder.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ message: "Order cancelled" });
}
