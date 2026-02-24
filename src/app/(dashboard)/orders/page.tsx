"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface PendingOrder {
  id: string;
  tickerSymbol: string;
  type: "BUY" | "SELL";
  orderType: string;
  targetPrice: string;
  quantity: string | null;
  dollarAmount: string | null;
  orderMode: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
}

interface TradeActivity {
  id: string;
  tickerSymbol: string;
  type: string;
  orderType: string;
  quantity: string;
  pricePerShare: string;
  totalAmount: string;
  timestamp: string;
}

export default function OrdersPage() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [trades, setTrades] = useState<TradeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "orders">("activity");
  const [searchSymbol, setSearchSymbol] = useState("");
  const [filterType, setFilterType] = useState<"all" | "BUY" | "SELL">("all");

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, historyRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/trade/history?limit=50"),
      ]);
      const ordersData = await ordersRes.json();
      const historyData = await historyRes.json();
      setPendingOrders(ordersData.orders ?? []);
      setTrades(historyData.trades ?? []);
    } catch {
      setPendingOrders([]);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function cancelOrder(id: string) {
    await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  const symbolLower = searchSymbol.trim().toLowerCase();
  const active = pendingOrders
    .filter((o) => o.status === "PENDING")
    .filter((o) => !symbolLower || o.tickerSymbol.toLowerCase().includes(symbolLower));
  const orderHistory = pendingOrders
    .filter((o) => o.status !== "PENDING")
    .filter((o) => !symbolLower || o.tickerSymbol.toLowerCase().includes(symbolLower));
  const filteredTrades = trades.filter((t) => {
    if (symbolLower && !t.tickerSymbol.toLowerCase().includes(symbolLower)) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Orders & Activity</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          <strong>Activity</strong> shows all your trades (market + executed limit/stop). <strong>Orders</strong> shows only pending limit and stop orders.
        </p>
      </div>

      {/* Sticky Header for Search & Tabs */}
      <div className="sticky top-[48px] lg:top-[56px] z-10 bg-zinc-100 dark:bg-zinc-950 pb-4 pt-2 -mx-3 px-3 sm:-mx-5 sm:px-5">
        {/* Search & filter — touch-friendly on mobile */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Filter by symbol..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="flex-1 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:py-2 sm:text-sm"
          />
          {activeTab === "activity" && (
            <div className="flex rounded-xl bg-zinc-200/50 p-1 dark:bg-zinc-800">
              {(["all", "BUY", "SELL"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`rounded-lg px-3 py-2.5 min-h-[40px] text-xs font-semibold transition touch-manipulation sm:py-1.5 sm:min-h-0 ${
                    filterType === t ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {t === "all" ? "All" : t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs — min 44px on mobile */}
        <div className="flex gap-1 rounded-xl bg-zinc-200/50 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`flex-1 rounded-lg py-3 min-h-[44px] text-sm font-semibold transition touch-manipulation sm:py-2.5 sm:min-h-0 ${
              activeTab === "activity"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Activity ({filteredTrades.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 rounded-lg py-3 min-h-[44px] text-sm font-semibold transition touch-manipulation sm:py-2.5 sm:min-h-0 ${
              activeTab === "orders"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Orders ({active.length})
          </button>
        </div>
      </div>

      {loading ? (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-14 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                  <div className="h-2.5 w-24 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <div className="ml-auto h-3.5 w-16 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                <div className="ml-auto h-2.5 w-12 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Activity tab: recent trades */}
          {activeTab === "activity" && (
            <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              {trades.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    <svg className="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">No activity yet</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Market and limit orders you execute will appear here.</p>
                  <Link href="/trade" className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                    Start trading
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredTrades.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trade?symbol=${t.tickerSymbol}`}
                      className="flex items-center justify-between px-4 py-4 min-h-[56px] transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 touch-manipulation sm:px-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${
                          t.type === "BUY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {t.type === "BUY" ? "Bought" : "Sold"}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{t.tickerSymbol}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {Number(t.quantity) >= 1 ? Number(t.quantity).toFixed(2) : Number(t.quantity).toFixed(6)} shares @ ${Number(t.pricePerShare).toFixed(2)}
                            {t.orderType !== "MARKET" && ` · ${t.orderType}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${t.type === "BUY" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {t.type === "BUY" ? "-" : "+"}${Number(t.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders tab: pending limit/stop */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Active orders</h2>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Limit and stop orders waiting to execute. Market orders fill immediately and appear in Activity.</p>
                </div>
                {active.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">No pending orders</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Place a limit or stop order on the Trade page to see it here.</p>
                    <Link href="/trade" className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">Go to Trade →</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {active.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${
                            o.type === "BUY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {o.type}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{o.tickerSymbol}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {o.orderType} @ ${Number(o.targetPrice).toFixed(2)} · {o.orderMode === "DOLLARS" ? `$${Number(o.dollarAmount).toFixed(2)}` : `${Number(o.quantity).toFixed(4)} shares`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancelOrder(o.id)}
                          className="rounded-xl border border-zinc-200 px-4 py-3 min-h-[44px] text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition touch-manipulation"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {orderHistory.length > 0 && (
                <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                  <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Order history</h2>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {orderHistory.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                            o.type === "BUY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {o.type}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{o.tickerSymbol}</p>
                            <p className="text-xs text-zinc-400">{o.orderType} @ ${Number(o.targetPrice).toFixed(2)}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          o.status === "EXECUTED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : o.status === "CANCELLED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
