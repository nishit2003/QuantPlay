import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const orders = await prisma.pendingOrder.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(rawBody);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { symbol, type, orderType, targetPrice, mode, quantity, dollarAmount } = parsed.data;

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
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

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
