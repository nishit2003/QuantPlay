import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market/yahoo";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await prisma.watchlist.findUnique({
    where: { userId: session.user.id },
    include: { items: { orderBy: { addedAt: "desc" } } },
  });

  if (!watchlist || watchlist.items.length === 0) {
    return NextResponse.json({ items: [] });
  }

  // Fetch live quotes for all watchlist items
  const enrichedItems = await Promise.all(
    watchlist.items.map(async (item) => {
      const quote = await getQuote(item.tickerSymbol);
      return {
        id: item.id,
        tickerSymbol: item.tickerSymbol,
        addedAt: item.addedAt,
        price: quote?.regularMarketPrice ?? null,
        change: quote?.regularMarketChange ?? null,
        changePercent: quote?.regularMarketChangePercent ?? null,
        shortName: quote?.shortName ?? item.tickerSymbol,
      };
    })
  );

  return NextResponse.json({ items: enrichedItems });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const symbol = body.symbol?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  let watchlist = await prisma.watchlist.findUnique({
    where: { userId: session.user.id },
  });

  if (!watchlist) {
    watchlist = await prisma.watchlist.create({
      data: { userId: session.user.id },
    });
  }

  const existing = await prisma.watchlistItem.findUnique({
    where: { watchlistId_tickerSymbol: { watchlistId: watchlist.id, tickerSymbol: symbol } },
  });

  if (existing) {
    return NextResponse.json({ message: "Already in watchlist" });
  }

  await prisma.watchlistItem.create({
    data: { watchlistId: watchlist.id, tickerSymbol: symbol },
  });

  return NextResponse.json({ message: "Added to watchlist" }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const watchlist = await prisma.watchlist.findUnique({
    where: { userId: session.user.id },
  });

  if (!watchlist) {
    return NextResponse.json({ error: "No watchlist found" }, { status: 404 });
  }

  await prisma.watchlistItem.deleteMany({
    where: { watchlistId: watchlist.id, tickerSymbol: symbol },
  });

  return NextResponse.json({ message: "Removed from watchlist" });
}
