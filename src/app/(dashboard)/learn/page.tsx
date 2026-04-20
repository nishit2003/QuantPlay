"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Module {
  slug: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
}

const MODULES: Module[] = [
  {
    slug: "charts",
    title: "Reading Stock Charts",
    subtitle: "Line vs candlestick, OHLC, timeframes, volume — the foundation of trading.",
    difficulty: "Beginner",
    readTime: "8 min",
    gradient: "from-emerald-500/20 to-teal-500/20 dark:from-emerald-900/30 dark:to-teal-900/30",
    borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
    icon: (
      <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    slug: "indicators",
    title: "Technical Indicators",
    subtitle: "SMA, EMA, RSI, MACD, Bollinger Bands — decode the signals professionals use.",
    difficulty: "Intermediate",
    readTime: "12 min",
    gradient: "from-blue-500/20 to-indigo-500/20 dark:from-blue-900/30 dark:to-indigo-900/30",
    borderColor: "border-blue-200/60 dark:border-blue-800/40",
    icon: (
      <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    slug: "fundamentals",
    title: "Fundamental Analysis",
    subtitle: "P/E ratio, EPS, market cap — learn to judge if a stock is cheap or expensive.",
    difficulty: "Intermediate",
    readTime: "10 min",
    gradient: "from-violet-500/20 to-purple-500/20 dark:from-violet-900/30 dark:to-purple-900/30",
    borderColor: "border-violet-200/60 dark:border-violet-800/40",
    icon: (
      <svg className="h-7 w-7 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
      </svg>
    ),
  },
  {
    slug: "orders",
    title: "Order Types & Execution",
    subtitle: "Market, limit, and stop-loss orders — when to use each and why it matters.",
    difficulty: "Beginner",
    readTime: "7 min",
    gradient: "from-amber-500/20 to-orange-500/20 dark:from-amber-900/30 dark:to-orange-900/30",
    borderColor: "border-amber-200/60 dark:border-amber-800/40",
    icon: (
      <svg className="h-7 w-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
  },
  {
    slug: "risk",
    title: "Risk Management",
    subtitle: "Position sizing, the 1% rule, stop-losses — protect your capital like a pro.",
    difficulty: "Intermediate",
    readTime: "9 min",
    gradient: "from-rose-500/20 to-pink-500/20 dark:from-rose-900/30 dark:to-pink-900/30",
    borderColor: "border-rose-200/60 dark:border-rose-800/40",
    icon: (
      <svg className="h-7 w-7 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    slug: "psychology",
    title: "Trading Psychology",
    subtitle: "FOMO, loss aversion, revenge trading — master your mind to master the market.",
    difficulty: "Advanced",
    readTime: "8 min",
    gradient: "from-cyan-500/20 to-sky-500/20 dark:from-cyan-900/30 dark:to-sky-900/30",
    borderColor: "border-cyan-200/60 dark:border-cyan-800/40",
    icon: (
      <svg className="h-7 w-7 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
];

const DIFFICULTY_STYLES = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function useCompletedModules() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("qp_learn_completed") || "[]") as string[];
      setCompleted(new Set(saved));
    } catch { /* ignore */ }
  }, []);
  return completed;
}

export default function LearnPage() {
  const completed = useCompletedModules();
  const progress = MODULES.length > 0 ? Math.round((completed.size / MODULES.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 p-6 sm:p-8 dark:border-zinc-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Trading Academy</h1>
              <p className="text-sm text-zinc-400">Master the skills that separate beginners from professionals.</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-400">Your Progress</span>
                <span className="text-xs font-bold text-emerald-400">{completed.size}/{MODULES.length} completed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {progress === 100 && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5">
                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold text-emerald-400">All Done!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick link to glossary */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/learn/glossary" className="flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-700">
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          Trading Glossary (A–Z)
        </Link>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">50+ terms explained simply</span>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod, idx) => {
          const done = completed.has(mod.slug);
          return (
            <Link
              key={mod.slug}
              href={`/learn/${mod.slug}`}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${mod.gradient} ${mod.borderColor} p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
            >
              {/* Module number */}
              <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400/50 dark:text-zinc-600">
                Module {idx + 1}
              </span>

              {/* Completed check */}
              {done && (
                <div className="absolute top-3 right-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="mb-4">{mod.icon}</div>
              <h3 className="text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                {mod.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 line-clamp-3 dark:text-zinc-400">
                {mod.subtitle}
              </p>

              <div className="mt-5 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY_STYLES[mod.difficulty]}`}>
                  {mod.difficulty}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{mod.readTime} read</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
