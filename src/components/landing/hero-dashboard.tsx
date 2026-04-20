"use client";

import Image from "next/image";

/**
 * Faithful in-code recreation of the actual QuantPlay dashboard.
 * Mirrors the layout in `src/components/dashboard/dashboard-portfolio.tsx`
 * (portfolio hero → quick stats → performance chart → holdings) so the
 * homepage shows what users actually get, not a stock graphic.
 *
 * All data is illustrative/static — no fetches, no SSR cost.
 */

interface QuickStat {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
}

const QUICK_STATS: QuickStat[] = [
  { label: "Cash", value: "$413.20", sub: "Available to trade" },
  { label: "Invested", value: "$834.63", sub: "At current price" },
  { label: "Cost basis", value: "$687.04", sub: "What you paid" },
  { label: "Today", value: "+$18.42", sub: "Up", positive: true },
];

const HOLDINGS = [
  { sym: "AAPL", qty: "1.42", price: 232.14, value: 329.64, chg: 1.42 },
  { sym: "NVDA", qty: "0.21", price: 875.30, value: 183.81, chg: 3.18 },
  { sym: "MSFT", qty: "0.32", price: 428.91, value: 137.25, chg: 0.87 },
  { sym: "TSLA", qty: "0.74", price: 248.50, value: 183.93, chg: -2.04 },
] as const;

interface NavItem {
  label: string;
  icon: React.ComponentType;
  active?: boolean;
}

const NAV: NavItem[] = [
  { label: "Dashboard", active: true, icon: NavIconDashboard },
  { label: "Trade", icon: NavIconTrade },
  { label: "Watchlist", icon: NavIconWatchlist },
  { label: "Auto-Invest", icon: NavIconAuto },
  { label: "Leaderboard", icon: NavIconTrophy },
  { label: "Journal", icon: NavIconJournal },
  { label: "Learn", icon: NavIconBook },
];

export function HeroDashboard() {
  return (
    <div className="grid h-full w-full grid-cols-[180px_1fr] overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0a] dark:text-white sm:grid-cols-[200px_1fr]">
      {/* ─── Sidebar ─── */}
      <aside className="flex flex-col border-r border-zinc-200 bg-white dark:border-white/5 dark:bg-zinc-950">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-white/5">
          <Image
            src="/logo_bull.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 object-contain"
          />
          <span className="text-sm font-bold tracking-tight">QuantPlay</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium ${
                  item.active
                    ? "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <Icon />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="m-2.5 flex items-center gap-2 rounded-lg border border-orange-200/60 bg-gradient-to-r from-orange-50 to-red-50 px-2.5 py-2 dark:border-orange-500/20 dark:from-orange-500/10 dark:to-red-500/10">
          <span className="text-sm">🔥</span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-orange-600 dark:text-orange-400">
              7-day streak
            </p>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white/60 px-5 py-2.5 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Dashboard</h2>
            <span className="text-[10px] text-zinc-500">Welcome back, Trader.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              LIVE
            </span>
          </div>
        </div>

        {/* Scrollable body (decorative — no real scroll) */}
        <div className="flex-1 space-y-4 overflow-hidden p-5">
          {/* Portfolio hero */}
          <div className="rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50/50 p-5 dark:border-white/5 dark:from-zinc-900 dark:to-zinc-950/50">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Portfolio value
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">$1,247.83</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold text-emerald-500">
                +$247.83 (+24.78%)
              </span>
              <span className="text-[10px] text-zinc-400">All time</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-emerald-500">
                +$18.42 (+1.49%) today
              </span>
              <span className="text-[9px] text-zinc-400">
                Updates every 60s · Free market data
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-zinc-100 bg-white p-3 dark:border-white/5 dark:bg-zinc-900"
              >
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {s.label}
                </p>
                <p
                  className={`mt-0.5 text-sm font-bold tabular-nums ${
                    s.positive ? "text-emerald-500" : ""
                  }`}
                >
                  {s.value}
                </p>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Performance + Holdings split */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            {/* Performance chart */}
            <div className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-white/5 dark:bg-zinc-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Performance over time
                </p>
                <div className="flex gap-1">
                  {["1W", "1M", "3M", "ALL"].map((r, i) => (
                    <span
                      key={r}
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                        i === 1
                          ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative h-[130px] w-full">
                <svg
                  viewBox="0 0 400 130"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  <defs>
                    <linearGradient id="heroPerfGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,105 L40,100 L80,108 L120,82 L160,92 L200,68 L240,72 L280,48 L320,55 L360,28 L400,18"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0,105 L40,100 L80,108 L120,82 L160,92 L200,68 L240,72 L280,48 L320,55 L360,28 L400,18 L400,130 L0,130 Z"
                    fill="url(#heroPerfGlow)"
                  />
                </svg>
              </div>
            </div>

            {/* Allocation donut */}
            <div className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-white/5 dark:bg-zinc-900">
              <p className="mb-3 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Allocation
              </p>
              <div className="flex items-center gap-4">
                <Donut />
                <ul className="flex-1 space-y-1.5">
                  {[
                    { l: "AAPL", c: "#10b981", w: "26%" },
                    { l: "NVDA", c: "#3b82f6", w: "22%" },
                    { l: "TSLA", c: "#8b5cf6", w: "15%" },
                    { l: "Cash", c: "#71717a", w: "33%" },
                  ].map((s) => (
                    <li
                      key={s.l}
                      className="flex items-center gap-1.5 text-[10px]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: s.c }}
                      />
                      <span className="flex-1 text-zinc-600 dark:text-zinc-400">{s.l}</span>
                      <span className="font-mono font-semibold">{s.w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Holdings */}
          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white dark:border-white/5 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-white/5">
              <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Holdings
              </p>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Trade →
              </span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              {HOLDINGS.map((h) => {
                const up = h.chg >= 0;
                return (
                  <div
                    key={h.sym}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {h.sym.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold">{h.sym}</p>
                        <p className="text-[10px] text-zinc-500">
                          {h.qty} shares
                          <span
                            className={`ml-1 font-medium ${
                              up ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {up ? "+" : ""}
                            {h.chg.toFixed(2)}% today
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-semibold tabular-nums">
                        ${h.value.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-zinc-500 tabular-nums">
                        ${h.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tiny donut ─── */
function Donut() {
  const r = 18;
  const c = 2 * Math.PI * r;
  const slices = [
    { color: "#10b981", weight: 0.26 },
    { color: "#3b82f6", weight: 0.22 },
    { color: "#8b5cf6", weight: 0.15 },
    { color: "#71717a", weight: 0.37 },
  ];
  const segments = slices.reduce<{ color: string; len: number; offset: number }[]>(
    (acc, s) => {
      const len = c * s.weight;
      const offset = acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].len;
      acc.push({ color: s.color, len, offset });
      return acc;
    },
    [],
  );
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 50 50" className="h-full w-full -rotate-90">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="6"
            strokeDasharray={`${seg.len} ${c - seg.len}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── Sidebar icons ─── */
function NavIconDashboard() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}
function NavIconTrade() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  );
}
function NavIconWatchlist() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}
function NavIconAuto() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
  );
}
function NavIconTrophy() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
    </svg>
  );
}
function NavIconJournal() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
function NavIconBook() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}
