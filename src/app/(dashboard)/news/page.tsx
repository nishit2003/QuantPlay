"use client";

import { useState, useEffect } from "react";

interface NewsItem { title: string; publisher: string; link: string; publishedAt: string; thumbnail: string | null }

// Curated earnings calendar data (upcoming notable earnings)
const EARNINGS_CALENDAR = [
  { ticker: "AAPL", name: "Apple Inc.", date: "2026-04-24", time: "AMC", epsEstimate: 1.62 },
  { ticker: "MSFT", name: "Microsoft Corp.", date: "2026-04-22", time: "AMC", epsEstimate: 3.22 },
  { ticker: "GOOGL", name: "Alphabet Inc.", date: "2026-04-22", time: "AMC", epsEstimate: 2.01 },
  { ticker: "META", name: "Meta Platforms", date: "2026-04-23", time: "AMC", epsEstimate: 5.28 },
  { ticker: "AMZN", name: "Amazon.com Inc.", date: "2026-04-24", time: "AMC", epsEstimate: 1.36 },
  { ticker: "TSLA", name: "Tesla Inc.", date: "2026-04-22", time: "AMC", epsEstimate: 0.42 },
  { ticker: "NVDA", name: "NVIDIA Corp.", date: "2026-05-28", time: "AMC", epsEstimate: 0.89 },
  { ticker: "NFLX", name: "Netflix Inc.", date: "2026-04-17", time: "AMC", epsEstimate: 5.68 },
  { ticker: "AMD", name: "AMD Inc.", date: "2026-04-29", time: "AMC", epsEstimate: 0.94 },
  { ticker: "JPM", name: "JPMorgan Chase", date: "2026-04-11", time: "BMO", epsEstimate: 4.61 },
  { ticker: "V", name: "Visa Inc.", date: "2026-04-22", time: "AMC", epsEstimate: 2.68 },
  { ticker: "DIS", name: "Walt Disney", date: "2026-05-07", time: "AMC", epsEstimate: 1.23 },
];

// Key economic events
const ECONOMIC_EVENTS = [
  { date: "2026-04-30", event: "FOMC Interest Rate Decision", impact: "High", icon: "🏦" },
  { date: "2026-05-02", event: "Non-Farm Payrolls (Apr)", impact: "High", icon: "📊" },
  { date: "2026-05-13", event: "CPI Inflation Report (Apr)", impact: "High", icon: "📈" },
  { date: "2026-05-15", event: "Retail Sales (Apr)", impact: "Medium", icon: "🛒" },
  { date: "2026-05-27", event: "Consumer Confidence Index", impact: "Medium", icon: "😀" },
  { date: "2026-06-11", event: "FOMC Interest Rate Decision", impact: "High", icon: "🏦" },
  { date: "2026-06-13", event: "CPI Inflation Report (May)", impact: "High", icon: "📈" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"news" | "earnings" | "economic">("news");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/market/market-news");
        const data = await res.json();
        setNews(data.news ?? []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const upcomingEarnings = EARNINGS_CALENDAR
    .filter((e) => new Date(e.date) >= new Date(new Date().toISOString().split("T")[0]))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingEvents = ECONOMIC_EVENTS
    .filter((e) => new Date(e.date) >= new Date(new Date().toISOString().split("T")[0]))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">Market News & Events</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">Stay informed with real-time news, earnings, and economic events.</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {([
          { key: "news", label: "📰 Headlines", count: news.length },
          { key: "earnings", label: "📊 Earnings Calendar", count: upcomingEarnings.length },
          { key: "economic", label: "🏦 Economic Events", count: upcomingEvents.length },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition ${
              tab === t.key ? "bg-white shadow-sm text-zinc-900 dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* News */}
      {tab === "news" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
            </div>
          ) : news.length === 0 ? (
            <div className="p-16 text-center text-sm text-zinc-400">No news available right now.</div>
          ) : (
            news.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                className="group flex gap-4 rounded-2xl border border-zinc-200/60 bg-white p-4 transition hover:shadow-md hover:border-zinc-300 dark:border-zinc-800/60 dark:bg-zinc-900 dark:hover:border-zinc-700">
                {item.thumbnail && (
                  <div className="hidden sm:block h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium">{item.publisher}</span>
                    <span>·</span>
                    <span>{timeAgo(item.publishedAt)}</span>
                  </div>
                </div>
                <svg className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0 mt-1 group-hover:text-emerald-500 transition" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            ))
          )}
        </div>
      )}

      {/* Earnings Calendar */}
      {tab === "earnings" && (
        <div className="rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 overflow-hidden">
          {upcomingEarnings.length === 0 ? (
            <div className="p-16 text-center text-sm text-zinc-400">No upcoming earnings this period.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">Time</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400">EPS Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {upcomingEarnings.map((e) => {
                  const date = new Date(e.date + "T00:00:00");
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === date.toDateString();
                  return (
                    <tr key={e.ticker} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                      <td className="px-4 py-3">
                        <a href={`/trade?symbol=${e.ticker}`} className="flex items-center gap-2.5 group">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {e.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{e.ticker}</p>
                            <p className="text-[10px] text-zinc-400">{e.name}</p>
                          </div>
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-700 dark:text-zinc-300">{date.toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                          {isToday && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">TODAY</span>}
                          {isTomorrow && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">TOMORROW</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{e.time === "BMO" ? "Before Open" : "After Close"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-white">${e.epsEstimate.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Economic Events */}
      {tab === "economic" && (
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="p-16 text-center text-sm text-zinc-400">No upcoming events.</div>
          ) : (
            upcomingEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-800">
                  {e.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{e.event}</h3>
                  <p className="text-xs text-zinc-400">{new Date(e.date + "T00:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  e.impact === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  {e.impact} Impact
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
