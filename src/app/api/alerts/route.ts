import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      id: a.id,
      tickerSymbol: a.tickerSymbol,
      targetPrice: a.targetPrice.toString(),
      direction: a.direction,
      triggered: a.triggered,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  let body: { symbol?: string; targetPrice?: number; direction?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const symbol = body.symbol?.toUpperCase();
  const targetPrice = body.targetPrice;
  const direction = body.direction === "below" ? "below" : "above";

  if (!symbol || targetPrice == null || targetPrice <= 0) {
    return NextResponse.json(
      { error: "symbol and targetPrice (positive number) are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.priceAlert.count({
    where: { userId: session.user.id, triggered: false },
  });
  if (existing >= 10) {
    return NextResponse.json(
      { error: "Maximum 10 active alerts. Delete one to add another." },
      { status: 400 }
    );
  }

  const alert = await prisma.priceAlert.create({
    data: {
      userId: session.user.id,
      tickerSymbol: symbol,
      targetPrice,
      direction,
    },
  });

  return NextResponse.json(
    {
      message: `Alert set: ${symbol} ${direction} $${targetPrice.toFixed(2)}`,
      alert: {
        id: alert.id,
        tickerSymbol: alert.tickerSymbol,
        targetPrice: alert.targetPrice.toString(),
        direction: alert.direction,
        triggered: alert.triggered,
        createdAt: alert.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const alert = await prisma.priceAlert.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  await prisma.priceAlert.delete({ where: { id } });
  return NextResponse.json({ message: "Alert deleted" });
}
