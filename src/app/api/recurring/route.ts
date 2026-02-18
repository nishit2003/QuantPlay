import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.recurringOrder.findMany({
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

  const body = await request.json();
  const { symbol, amount, frequency } = body;

  if (!symbol || !amount || !frequency) {
    return NextResponse.json({ error: "symbol, amount, and frequency are required" }, { status: 400 });
  }

  if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency)) {
    return NextResponse.json({ error: "frequency must be DAILY, WEEKLY, or MONTHLY" }, { status: 400 });
  }

  if (amount <= 0) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }

  const now = new Date();
  let nextRunAt: Date;
  switch (frequency) {
    case "DAILY":
      nextRunAt = new Date(now);
      nextRunAt.setDate(nextRunAt.getDate() + 1);
      nextRunAt.setHours(10, 0, 0, 0);
      break;
    case "WEEKLY":
      nextRunAt = new Date(now);
      nextRunAt.setDate(nextRunAt.getDate() + (8 - nextRunAt.getDay()) % 7 || 7);
      nextRunAt.setHours(10, 0, 0, 0);
      break;
    case "MONTHLY":
      nextRunAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 10, 0, 0);
      break;
    default:
      nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  const order = await prisma.recurringOrder.create({
    data: {
      userId: session.user.id,
      tickerSymbol: symbol.toUpperCase(),
      amount: parseFloat(Number(amount).toFixed(2)),
      frequency,
      nextRunAt,
    },
  });

  return NextResponse.json({ message: "Recurring order created", order }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, active } = body;

  if (!id || typeof active !== "boolean") {
    return NextResponse.json({ error: "id and active (boolean) are required" }, { status: 400 });
  }

  const order = await prisma.recurringOrder.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.recurringOrder.update({ where: { id }, data: { active } });

  return NextResponse.json({ message: active ? "Resumed" : "Paused" });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const order = await prisma.recurringOrder.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.recurringOrder.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}
