"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const PortfolioChart = dynamic(
  () => import("@/components/dashboard/portfolio-chart").then((m) => m.PortfolioChart),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" /> }
);

const PerformanceChart = dynamic(
  () => import("@/components/dashboard/performance-chart").then((m) => m.PerformanceChart),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" /> }
);

interface PortfolioItemSerialized {
  id: string;
  tickerSymbol: string;
  quantity: string;
  averageCostBasis: string;
}

interface Quote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

interface TradeSerialized {
  id: string;
  tickerSymbol: string;
  type: string;
  quantity: string;
  pricePerShare: string;
  totalAmount: string;
  timestamp: string;
}

const REFRESH_MS = 60_000; // 60s

interface DashboardPortfolioProps {
  userName: string | null;
  cashBalance: number;
  portfolioItems: PortfolioItemSerialized[];
  recentTrades: TradeSerialized[];
  initialBalance: number;
}

export function DashboardPortfolio({
  userName,
  cashBalance,
  portfolioItems,
  recentTrades,
  initialBalance,
}: DashboardPortfolioProps) {
  const [quotes, setQuotes] = useState<Record<string, Quote | null>>({});
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<{ date: string; value: number }[]>([]);

  const symbolsKey = useMemo(
    () => portfolioItems.map((i) => i.tickerSymbol).join(","),
    [portfolioItems]
  );

  const fetchQuotes = useCallback(async () => {
    if (!symbolsKey) {
      setQuotes({});
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(symbolsKey)}`);
      const data = await res.json();
      setQuotes(data.quotes ?? {});
    } catch {
      setQuotes({});
    } finally {
      setLoading(false);
    }
  }, [symbolsKey]);

  useEffect(() => {
    fetchQuotes();
    const t = setInterval(fetchQuotes, REFRESH_MS);
    return () => clearInterval(t);
  }, [fetchQuotes]);

  useEffect(() => {
    fetch("/api/portfolio/snapshots")
      .then((r) => r.json())
      .then((d) => setSnapshots(d.snapshots ?? []))
      .catch(() => setSnapshots([]));
  }, []);

  const { holdingsValue, costBasis, dayChange } = useMemo(() => {
    let hv = 0;
    let cb = 0;
    let dc = 0;
    for (const item of portfolioItems) {
      const q = quotes[item.tickerSymbol];
      const price = q?.regularMarketPrice ?? Number(item.averageCostBasis);
      const qty = Number(item.quantity);
      hv += price * qty;
      cb += Number(item.averageCostBasis) * qty;
      if (q) dc += q.regularMarketChange * qty;
    }
    return { holdingsValue: hv, costBasis: cb, dayChange: dc };
  }, [portfolioItems, quotes]);

  const totalPortfolio = cashBalance + holdingsValue;
  const totalReturn = totalPortfolio - initialBalance;
  const totalReturnPercent = initialBalance > 0 ? (totalReturn / initialBalance) * 100 : 0;
  const dayChangePercent = holdingsValue > 0 ? (dayChange / holdingsValue) * 100 : 0;

  const quickStats = useMemo(() => [
    { label: "Cash", value: "$" + cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }), sub: "Available to trade", color: "", title: "Cash available to place new orders" },
    { label: "Invested", value: "$" + holdingsValue.toLocaleString("en-US", { minimumFractionDigits: 2 }), sub: loading ? "Loading…" : "At current price", color: "", title: "Current value of your holdings at live prices" },
    { label: "Cost basis", value: "$" + costBasis.toLocaleString("en-US", { minimumFractionDigits: 2 }), sub: "What you paid", color: "", title: "Total amount you paid for your current holdings" },
    { label: "Today", value: (dayChange >= 0 ? "+$" : "-$") + (dayChange >= 0 ? dayChange.toFixed(2) : Math.abs(dayChange).toFixed(2)), sub: dayChange >= 0 ? "Up" : "Down", color: dayChange >= 0 ? "text-emerald-500" : "text-red-500", title: "Change in holdings value since market open" },
  ], [cashBalance, holdingsValue, costBasis, dayChange, loading]);

  return (
    <div className="space-y-6">
      {/* Robinhood-style hero: big portfolio value, more padding on mobile */}
      <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/50 p-5 shadow-sm dark:from-zinc-900 dark:to-zinc-950/50 dark:shadow-none border border-zinc-200/60 dark:border-zinc-800 sm:p-6">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400" title="Cash + current value of all holdings">
          Portfolio value
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
          ${totalPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className={`text-lg font-semibold ${totalReturn >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)} ({totalReturn >= 0 ? "+" : ""}{totalReturnPercent.toFixed(2)}%)
          </span>
          <span className="text-xs text-zinc-400 shrink-0" title="Return since you started (vs. your starting balance)">All time</span>
        </div>
        {holdingsValue > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-sm font-medium ${dayChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)} ({dayChange >= 0 ? "+" : ""}{dayChangePercent.toFixed(2)}%) today
            </span>
            <span className="text-[10px] text-zinc-400">Updates every 60s · Free market data</span>
          </div>
        )}
      </div>

      {/* Quick stats row — Robinhood-style cards, larger tap area on mobile */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {quickStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-100 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4" title={s.title}>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{s.label}</p>
            <p className={`mt-0.5 text-base font-bold tabular-nums sm:text-lg ${s.color || "text-zinc-900 dark:text-white"}`}>{s.value}</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Performance over time */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Performance over time</h2>
        {snapshots.length >= 2 ? (
          <PerformanceChart snapshots={snapshots} />
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Chart will appear once we&apos;ve recorded your portfolio value (runs daily).</p>
          </div>
        )}
      </div>

      {/* Portfolio allocation (live value) */}
      {portfolioItems.length > 0 && (
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Portfolio allocation</h2>
          <PortfolioChart
            holdings={portfolioItems.map((i) => ({
              symbol: i.tickerSymbol,
              value: (quotes[i.tickerSymbol]?.regularMarketPrice ?? Number(i.averageCostBasis)) * Number(i.quantity),
            }))}
            cashBalance={cashBalance}
          />
        </div>
      )}

      {/* Holdings with live price */}
      <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Holdings</h2>
          <Link href="/trade" className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 touch-manipulation">
            Trade
          </Link>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {portfolioItems.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <svg className="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">No holdings yet</p>
              <Link href="/trade" className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 touch-manipulation">
                Make your first trade →
              </Link>
            </div>
          ) : (
            portfolioItems.map((item) => {
              const q = quotes[item.tickerSymbol];
              const price = q?.regularMarketPrice ?? Number(item.averageCostBasis);
              const change = q?.regularMarketChange ?? 0;
              const changePct = q?.regularMarketChangePercent ?? 0;
              const value = price * Number(item.quantity);
              const isUp = change >= 0;
              return (
                <Link
                  key={item.id}
                  href={`/trade?symbol=${item.tickerSymbol}`}
                  className="flex items-center justify-between px-4 py-4 min-h-[56px] transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 touch-manipulation sm:px-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.tickerSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{item.tickerSymbol}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {Number(item.quantity) >= 1 ? Number(item.quantity).toFixed(2) : Number(item.quantity).toFixed(6)} shares
                        {q && (
                          <span className={`ml-1 font-medium ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                            {isUp ? "+" : ""}{changePct.toFixed(2)}% today
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      ${price.toFixed(2)} {loading && !q ? "…" : ""}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent activity</h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {recentTrades.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No trades yet</p>
            </div>
          ) : (
            recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between px-4 py-3.5 min-h-[56px] touch-manipulation sm:px-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                    trade.type === "BUY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {trade.type === "BUY" ? "Bought" : "Sold"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{trade.tickerSymbol}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {Number(trade.quantity) >= 1 ? Number(trade.quantity).toFixed(2) : Number(trade.quantity).toFixed(6)} shares @ ${Number(trade.pricePerShare).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${trade.type === "BUY" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {trade.type === "BUY" ? "-" : "+"}${Number(trade.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {new Date(trade.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
