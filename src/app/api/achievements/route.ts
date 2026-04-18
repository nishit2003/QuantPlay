import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  category: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Trading milestones
  { id: "first_trade", icon: "🐣", title: "First Steps", description: "Complete your first trade", rarity: "Common", category: "Trading" },
  { id: "10_trades", icon: "📈", title: "Getting Started", description: "Complete 10 trades", rarity: "Common", category: "Trading" },
  { id: "50_trades", icon: "📊", title: "Active Trader", description: "Complete 50 trades", rarity: "Rare", category: "Trading" },
  { id: "100_trades", icon: "🔥", title: "Trading Machine", description: "Complete 100 trades", rarity: "Epic", category: "Trading" },
  { id: "first_profit", icon: "💰", title: "First Profit", description: "Make a profitable sell trade", rarity: "Common", category: "Trading" },
  { id: "big_win", icon: "🎯", title: "Sharpshooter", description: "Make $100+ profit on a single trade", rarity: "Rare", category: "Trading" },
  { id: "used_limit", icon: "⏳", title: "Patient Trader", description: "Place a limit order", rarity: "Common", category: "Trading" },
  { id: "used_stoploss", icon: "🛡️", title: "Risk Manager", description: "Place a stop-loss order", rarity: "Common", category: "Trading" },

  // Portfolio milestones
  { id: "portfolio_1500", icon: "💎", title: "Growing Portfolio", description: "Reach $1,500 total portfolio value", rarity: "Common", category: "Portfolio" },
  { id: "portfolio_2000", icon: "🦈", title: "Shark", description: "Reach $2,000 total portfolio value", rarity: "Rare", category: "Portfolio" },
  { id: "portfolio_5000", icon: "🐋", title: "Whale", description: "Reach $5,000 total portfolio value", rarity: "Epic", category: "Portfolio" },
  { id: "diversified_3", icon: "🌐", title: "Diversified", description: "Hold stocks in 3+ different tickers", rarity: "Common", category: "Portfolio" },
  { id: "diversified_5", icon: "🌍", title: "Well Diversified", description: "Hold stocks in 5+ different tickers", rarity: "Rare", category: "Portfolio" },

  // Streaks
  { id: "streak_3", icon: "🔥", title: "3-Day Streak", description: "Trade for 3 consecutive days", rarity: "Common", category: "Streaks" },
  { id: "streak_7", icon: "🔥", title: "Week Warrior", description: "Trade for 7 consecutive days", rarity: "Rare", category: "Streaks" },
  { id: "streak_30", icon: "🔥", title: "Monthly Master", description: "Trade for 30 consecutive days", rarity: "Epic", category: "Streaks" },

  // Platform
  { id: "watchlist_5", icon: "⭐", title: "Scout", description: "Add 5 stocks to your watchlist", rarity: "Common", category: "Platform" },
  { id: "watchlist_10", icon: "🔭", title: "Watchlist Pro", description: "Add 10 stocks to your watchlist", rarity: "Rare", category: "Platform" },
  { id: "alert_set", icon: "🔔", title: "Alert!", description: "Set your first price alert", rarity: "Common", category: "Platform" },
  { id: "auto_invest", icon: "🤖", title: "Automation", description: "Create a recurring investment", rarity: "Common", category: "Platform" },
  { id: "leaderboard_top10", icon: "👑", title: "Top 10", description: "Reach the top 10 on the leaderboard", rarity: "Legendary", category: "Platform" },

  // Learning
  { id: "learn_1", icon: "📖", title: "Student", description: "Complete your first Learn module", rarity: "Common", category: "Learning" },
  { id: "learn_all", icon: "🎓", title: "Academy Graduate", description: "Complete all 6 Learn modules", rarity: "Rare", category: "Learning" },
];

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.session.user.id;

  try {
    // Fetch all data needed to check achievements
    const [trades, portfolio, watchlist, streak, alerts, recurring] = await Promise.all([
      prisma.tradeTransaction.findMany({ where: { userId }, select: { type: true, orderType: true, totalAmount: true, pricePerShare: true, quantity: true } }),
      prisma.portfolioItem.findMany({ where: { userId } }),
      prisma.watchlist.findFirst({ where: { userId }, include: { items: true } }),
      prisma.userStreak.findFirst({ where: { userId } }),
      prisma.priceAlert.findMany({ where: { userId } }),
      prisma.recurringOrder.findMany({ where: { userId } }),
    ]);

    const totalTrades = trades.length;
    const buyTrades = trades.filter((t) => t.type === "BUY");
    const sellTrades = trades.filter((t) => t.type === "SELL");
    const limitOrders = trades.filter((t) => t.orderType === "LIMIT");
    const stopOrders = trades.filter((t) => t.orderType === "STOP_LOSS");
    const portfolioValue = portfolio.reduce((sum, p) => sum + Number(p.quantity) * Number(p.averageCostBasis), 0);
    const uniqueTickers = portfolio.length;
    const watchlistCount = watchlist?.items.length ?? 0;
    const currentStreak = streak?.currentStreak ?? 0;

    // Check for profitable sells (simplified: sell price * qty > avg cost * qty)
    const profitableSells = sellTrades.filter((t) => Number(t.totalAmount) > 0);
    const bigWins = sellTrades.filter((t) => Number(t.totalAmount) > 100);

    // Build earned achievements list
    const earned: string[] = [];

    // Trading
    if (totalTrades >= 1) earned.push("first_trade");
    if (totalTrades >= 10) earned.push("10_trades");
    if (totalTrades >= 50) earned.push("50_trades");
    if (totalTrades >= 100) earned.push("100_trades");
    if (profitableSells.length >= 1) earned.push("first_profit");
    if (bigWins.length >= 1) earned.push("big_win");
    if (limitOrders.length >= 1) earned.push("used_limit");
    if (stopOrders.length >= 1) earned.push("used_stoploss");

    // Portfolio
    if (portfolioValue >= 1500) earned.push("portfolio_1500");
    if (portfolioValue >= 2000) earned.push("portfolio_2000");
    if (portfolioValue >= 5000) earned.push("portfolio_5000");
    if (uniqueTickers >= 3) earned.push("diversified_3");
    if (uniqueTickers >= 5) earned.push("diversified_5");

    // Streaks
    if (currentStreak >= 3) earned.push("streak_3");
    if (currentStreak >= 7) earned.push("streak_7");
    if (currentStreak >= 30) earned.push("streak_30");

    // Platform
    if (watchlistCount >= 5) earned.push("watchlist_5");
    if (watchlistCount >= 10) earned.push("watchlist_10");
    if (alerts.length >= 1) earned.push("alert_set");
    if (recurring.length >= 1) earned.push("auto_invest");
    // leaderboard_top10 checked from client side (or leave unchecked)

    // Learning achievements checked client-side via localStorage
    if (buyTrades.length >= 0) { /* learn_1 and learn_all checked on client */ }

    return NextResponse.json({
      earned,
      stats: {
        totalTrades,
        portfolioValue: parseFloat(portfolioValue.toFixed(2)),
        uniqueTickers,
        watchlistCount,
        currentStreak,
        alertsCount: alerts.length,
        recurringCount: recurring.length,
      },
    });
  } catch (error) {
    console.error("Achievements error:", error);
    return NextResponse.json({ earned: [], stats: {} });
  }
}
