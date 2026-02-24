"use client";

import { useEffect, useState, useCallback } from "react";

interface Ranking {
  userId: string;
  name: string;
  totalValue: number;
  returnPercent: number;
  portfolioValue: number;
  cashBalance: number;
}

interface Contest {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  winnerName: string | null;
  winningProfitPercentage: string | null;
  totalParticipants: number;
}

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setRankings(data.rankings ?? []);
      setPastContests(data.pastContests ?? []);
      setCurrentUserId(data.currentUserId ?? "");
    } catch {
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Contest timer: next Friday 4 PM ET
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function updateTimer() {
      const now = new Date();
      const target = new Date(now);
      const dayOfWeek = target.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
      target.setDate(target.getDate() + daysUntilFriday);
      target.setHours(16, 0, 0, 0);

      if (target <= now) target.setDate(target.getDate() + 7);

      const diff = target.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    }
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Leaderboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Weekly competition rankings by portfolio return.</p>
        </div>
        <div className="shrink-0 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Contest Ends In</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">{timeLeft}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-5 py-3.5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-20 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                  <div className="h-2.5 w-28 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                </div>
              </div>
              <div className="h-4 w-16 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Live rankings */}
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                This Week&apos;s Rankings
              </h2>
            </div>
            {rankings.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-500">No participants yet.</div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rankings.map((r, i) => {
                  const isMe = r.userId === currentUserId;
                  const isPositive = r.returnPercent >= 0;
                  return (
                    <div key={r.userId} className={`flex items-center justify-between px-5 py-3.5 ${isMe ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : i === 1 ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                            : i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {r.name}
                            {isMe && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">YOU</span>}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Portfolio: ${r.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{r.returnPercent.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past contests */}
          {pastContests.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Past Winners
                </h2>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pastContests.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {c.winnerName ?? "N/A"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(c.weekStartDate).toLocaleDateString()} — {new Date(c.weekEndDate).toLocaleDateString()} &middot; {c.totalParticipants} participants
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">
                      +{Number(c.winningProfitPercentage ?? 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
