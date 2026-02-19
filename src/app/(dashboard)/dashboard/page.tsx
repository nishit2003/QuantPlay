import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { DashboardPortfolio } from "@/components/dashboard/dashboard-portfolio";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [portfolioItems, recentTrades] = await Promise.all([
    prisma.portfolioItem.findMany({
      where: { userId: user.id },
      orderBy: { tickerSymbol: "asc" },
    }),
    prisma.tradeTransaction.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 15,
    }),
  ]);

  const cashBalance = Number(user.virtualCashBalance);
  const initialBalance = Number(user.startingVirtualCashBalance ?? 1000);

  const portfolioSerialized = portfolioItems.map((item) => ({
    id: item.id,
    tickerSymbol: item.tickerSymbol,
    quantity: item.quantity.toString(),
    averageCostBasis: item.averageCostBasis.toString(),
  }));

  const tradesSerialized = recentTrades.map((t) => ({
    id: t.id,
    tickerSymbol: t.tickerSymbol,
    type: t.type,
    orderType: t.orderType,
    orderMode: t.orderMode,
    quantity: t.quantity.toString(),
    pricePerShare: t.pricePerShare.toString(),
    totalAmount: t.totalAmount.toString(),
    timestamp: t.timestamp.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back, {user.name ?? "Trader"}.
        </p>
      </div>

      <DashboardPortfolio
        userName={user.name}
        cashBalance={cashBalance}
        portfolioItems={portfolioSerialized}
        recentTrades={tradesSerialized}
        initialBalance={initialBalance}
      />
    </div>
  );
}
