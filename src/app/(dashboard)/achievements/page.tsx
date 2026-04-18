"use client";

import { useState, useEffect } from "react";

interface AchievementDef {
  id: string; icon: string; title: string; description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary"; category: string;
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_trade", icon: "🐣", title: "First Steps", description: "Complete your first trade", rarity: "Common", category: "Trading" },
  { id: "10_trades", icon: "📈", title: "Getting Started", description: "Complete 10 trades", rarity: "Common", category: "Trading" },
  { id: "50_trades", icon: "📊", title: "Active Trader", description: "Complete 50 trades", rarity: "Rare", category: "Trading" },
  { id: "100_trades", icon: "🔥", title: "Trading Machine", description: "Complete 100 trades", rarity: "Epic", category: "Trading" },
  { id: "first_profit", icon: "💰", title: "First Profit", description: "Make a profitable sell trade", rarity: "Common", category: "Trading" },
  { id: "big_win", icon: "🎯", title: "Sharpshooter", description: "Make $100+ profit on a single trade", rarity: "Rare", category: "Trading" },
  { id: "used_limit", icon: "⏳", title: "Patient Trader", description: "Place a limit order", rarity: "Common", category: "Trading" },
  { id: "used_stoploss", icon: "🛡️", title: "Risk Manager", description: "Place a stop-loss order", rarity: "Common", category: "Trading" },
  { id: "portfolio_1500", icon: "💎", title: "Growing Portfolio", description: "Reach $1,500 total portfolio value", rarity: "Common", category: "Portfolio" },
  { id: "portfolio_2000", icon: "🦈", title: "Shark", description: "Reach $2,000 total portfolio value", rarity: "Rare", category: "Portfolio" },
  { id: "portfolio_5000", icon: "🐋", title: "Whale", description: "Reach $5,000 total portfolio value", rarity: "Epic", category: "Portfolio" },
  { id: "diversified_3", icon: "🌐", title: "Diversified", description: "Hold stocks in 3+ different tickers", rarity: "Common", category: "Portfolio" },
  { id: "diversified_5", icon: "🌍", title: "Well Diversified", description: "Hold stocks in 5+ different tickers", rarity: "Rare", category: "Portfolio" },
  { id: "streak_3", icon: "🔥", title: "3-Day Streak", description: "Trade for 3 consecutive days", rarity: "Common", category: "Streaks" },
  { id: "streak_7", icon: "🔥", title: "Week Warrior", description: "Trade for 7 consecutive days", rarity: "Rare", category: "Streaks" },
  { id: "streak_30", icon: "🔥", title: "Monthly Master", description: "Trade for 30 consecutive days", rarity: "Epic", category: "Streaks" },
  { id: "watchlist_5", icon: "⭐", title: "Scout", description: "Add 5 stocks to your watchlist", rarity: "Common", category: "Platform" },
  { id: "watchlist_10", icon: "🔭", title: "Watchlist Pro", description: "Add 10 stocks to your watchlist", rarity: "Rare", category: "Platform" },
  { id: "alert_set", icon: "🔔", title: "Alert!", description: "Set your first price alert", rarity: "Common", category: "Platform" },
  { id: "auto_invest", icon: "🤖", title: "Automation", description: "Create a recurring investment", rarity: "Common", category: "Platform" },
  { id: "leaderboard_top10", icon: "👑", title: "Top 10", description: "Reach the top 10 on the leaderboard", rarity: "Legendary", category: "Platform" },
  { id: "learn_1", icon: "📖", title: "Student", description: "Complete your first Learn module", rarity: "Common", category: "Learning" },
  { id: "learn_all", icon: "🎓", title: "Academy Graduate", description: "Complete all 6 Learn modules", rarity: "Rare", category: "Learning" },
];

const RARITY_STYLES = {
  Common: { bg: "bg-zinc-100 dark:bg-zinc-800", border: "border-zinc-200 dark:border-zinc-700", text: "text-zinc-500" },
  Rare: { bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-600 dark:text-blue-400" },
  Epic: { bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200 dark:border-purple-800", text: "text-purple-600 dark:text-purple-400" },
  Legendary: { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-600 dark:text-amber-400" },
};

const RARITY_GLOW = {
  Common: "",
  Rare: "shadow-blue-200/30 dark:shadow-blue-800/20",
  Epic: "shadow-purple-200/30 dark:shadow-purple-800/20",
  Legendary: "shadow-amber-200/50 dark:shadow-amber-800/30 animate-pulse",
};

const CATEGORIES = ["All", "Trading", "Portfolio", "Streaks", "Platform", "Learning"];

export default function AchievementsPage() {
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/achievements");
        const data = await res.json();
        const serverEarned = new Set<string>(data.earned ?? []);

        // Merge with localStorage-based learning achievements
        try {
          const completed = JSON.parse(localStorage.getItem("qp_learn_completed") || "[]") as string[];
          if (completed.length >= 1) serverEarned.add("learn_1");
          if (completed.length >= 6) serverEarned.add("learn_all");
        } catch { /* ignore */ }

        setEarned(serverEarned);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filteredAchievements = category === "All" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === category);
  const earnedCount = ACHIEVEMENTS.filter((a) => earned.has(a.id)).length;
  const progress = Math.round((earnedCount / ACHIEVEMENTS.length) * 100);

  if (loading) return (
    <div className="flex items-center justify-center p-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950 p-6 sm:p-8 dark:border-zinc-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Achievements</h1>
              <p className="text-sm text-zinc-400">Earn badges as you level up your trading skills.</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-400">{earnedCount} / {ACHIEVEMENTS.length} unlocked</span>
                <span className="text-xs font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Rarity summary */}
          <div className="mt-4 flex gap-4">
            {(["Common", "Rare", "Epic", "Legendary"] as const).map((r) => {
              const total = ACHIEVEMENTS.filter((a) => a.rarity === r).length;
              const got = ACHIEVEMENTS.filter((a) => a.rarity === r && earned.has(a.id)).length;
              return (
                <div key={r} className="text-center">
                  <p className={`text-lg font-bold ${RARITY_STYLES[r].text}`}>{got}/{total}</p>
                  <p className="text-[10px] text-zinc-500">{r}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              category === c ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>{c}</button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map((a) => {
          const unlocked = earned.has(a.id);
          const style = RARITY_STYLES[a.rarity];
          const glow = unlocked ? RARITY_GLOW[a.rarity] : "";

          return (
            <div key={a.id}
              className={`relative rounded-2xl border p-4 transition ${
                unlocked
                  ? `${style.bg} ${style.border} shadow-lg ${glow}`
                  : "bg-zinc-50/50 border-zinc-200/40 dark:bg-zinc-900/50 dark:border-zinc-800/40 opacity-50"
              }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${unlocked ? "" : "grayscale"}`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${unlocked ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"}`}>
                      {a.title}
                    </h3>
                    {unlocked && (
                      <svg className="h-4 w-4 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${unlocked ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                    {a.description}
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${style.text} ${style.bg}`}>
                    {a.rarity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
