"use client";

import { useEffect, useState } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  checkedIn?: boolean;
}

export function StreakCard() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check in on mount
    fetch("/api/streak", { method: "POST" })
      .then((r) => r.json())
      .then((data: StreakData) => {
        setStreak(data);
        if (data.checkedIn) {
          setAnimating(true);
          setTimeout(() => setAnimating(false), 1500);
        }
      })
      .catch(() => {});
  }, []);

  if (!streak) {
    return (
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800/60 dark:bg-zinc-900 animate-pulse sm:p-5">
        <div className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:h-16" />
      </div>
    );
  }

  const getMessage = (days: number): string => {
    if (days === 0) return "Start your streak today!";
    if (days === 1) return "Great start! Come back tomorrow 🚀";
    if (days < 5) return "Building momentum! Keep going 💪";
    if (days < 10) return "You're on fire! Don't stop now 🔥";
    if (days < 30) return "Incredible dedication! 🏆";
    if (days < 100) return "Legendary trader discipline! ⚡";
    return "Unstoppable! You're a trading machine! 🌟";
  };

  // Generate the last 7 days for the weekly calendar
  const weekDays = (() => {
    const days: { label: string; active: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

    // Find the most recent Sunday (start of week)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();

      // A day is "active" if it's today and we're checked in, or it's within the streak window
      let active = false;
      if (streak.lastActiveDate && streak.currentStreak > 0) {
        const lastActive = new Date(streak.lastActiveDate);
        const diffDays = Math.floor((lastActive.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        active = diffDays >= 0 && diffDays < streak.currentStreak;
      }

      days.push({
        label: dayLabels[i],
        active,
        isToday,
      });
    }
    return days;
  })();

  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 overflow-hidden">
      {/* Top section: streak count */}
      <div className="flex items-center justify-between p-3 sm:p-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-xl sm:text-2xl transition-transform duration-500 ${
              animating ? "scale-125" : "scale-100"
            } ${
              streak.currentStreak > 0
                ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/25"
                : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {streak.currentStreak > 0 ? "🔥" : "💤"}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-bold tabular-nums ${
                streak.currentStreak > 0
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}>
                {streak.currentStreak}
              </span>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                day{streak.currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Best: {streak.longestStreak} day{streak.longestStreak !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Motivational badge */}
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-[140px]">
            {getMessage(streak.currentStreak)}
          </p>
        </div>
      </div>

      {/* Weekly dots */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/60 px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center justify-between">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase">
                {day.label}
              </span>
              <div
                className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center transition-all ${
                  day.active
                    ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-sm shadow-orange-500/20"
                    : day.isToday
                    ? "border-2 border-dashed border-orange-400/50 dark:border-orange-500/40"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {day.active && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
