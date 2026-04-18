"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

interface JournalData {
  totalTrades: number; buyCount: number; sellCount: number;
  totalBuyAmount: number; totalSellAmount: number; netPnL: number;
  equityCurve: { date: string; value: number }[];
  recentTrades: { id: string; ticker: string; type: string; orderType: string; quantity: number; price: number; total: number; date: string }[];
  sectors: { name: string; count: number }[];
  topTickers: { ticker: string; trades: number; totalBought: number; totalSold: number; netPnL: number }[];
}

const SECTOR_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

function fmt(n: number): string {
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

export default function JournalPage() {
  const [data, setData] = useState<JournalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "trades" | "tickers">("overview");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/journal");
        setData(await res.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
    </div>
  );

  if (!data || data.totalTrades === 0) return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">Trade Journal</h1>
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-16 text-center dark:border-zinc-800/60 dark:bg-zinc-900">
        <div className="text-4xl mb-3">📓</div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">No trades yet</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Start trading to see your journal analytics here.</p>
      </div>
    </div>
  );

  const pnlPositive = data.netPnL >= 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">Trade Journal</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">Track your performance, analyze trades, and improve over time.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Trades", value: data.totalTrades.toString(), sub: `${data.buyCount} buys · ${data.sellCount} sells` },
          { label: "Net P&L", value: (pnlPositive ? "+" : "") + fmt(data.netPnL), sub: "Realized gains/losses", color: pnlPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500" },
          { label: "Total Bought", value: fmt(data.totalBuyAmount), sub: "Capital deployed" },
          { label: "Total Sold", value: fmt(data.totalSellAmount), sub: "Capital returned" },
        ].map((card, i) => (
          <div key={i} className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{card.label}</p>
            <p className={`text-xl font-bold mt-1 ${card.color ?? "text-zinc-900 dark:text-white"}`}>{card.value}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      {data.equityCurve.length > 1 && (
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Cumulative P&L Over Time</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.equityCurve}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={pnlPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={pnlPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: "short", day: "numeric" })} minTickGap={60} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} width={50}
                  tickFormatter={(v) => "$" + v.toFixed(0)} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 text-xs">
                      <p className="text-zinc-400">{new Date(p.date).toLocaleDateString()}</p>
                      <p className={`font-bold ${p.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>{p.value >= 0 ? "+" : ""}${p.value.toFixed(2)}</p>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="value" stroke={pnlPositive ? "#10b981" : "#ef4444"} strokeWidth={2} fill="url(#pnlGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sector + Tabs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Sector Pie */}
        {data.sectors.length > 0 && (
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Trading by Sector</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.sectors} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.sectors.map((_, i) => <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 text-xs">
                        <p className="font-semibold text-zinc-900 dark:text-white">{payload[0].name}</p>
                        <p className="text-zinc-400">{payload[0].value} trades</p>
                      </div>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.sectors.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                  {s.name} ({s.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800">
            {(["overview", "trades", "tickers"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  tab === t ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}>
                {t === "overview" ? "Top Tickers" : t === "trades" ? "Trade Log" : "Per-Ticker P&L"}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            {tab === "overview" && (
              <div className="space-y-2">
                {data.topTickers.map((t) => (
                  <div key={t.ticker} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{t.ticker}</span>
                      <span className="text-xs text-zinc-400">{t.trades} trades</span>
                    </div>
                    <span className={`text-sm font-bold ${t.netPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {t.netPnL >= 0 ? "+" : ""}{fmt(t.netPnL)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "trades" && (
              <div className="space-y-1.5">
                {data.recentTrades.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <div className="flex items-center gap-3">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.type === "BUY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {t.type}
                      </span>
                      <div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{t.ticker}</span>
                        <span className="text-xs text-zinc-400 ml-2">{t.quantity.toFixed(4)} @ ${t.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">${t.total.toFixed(2)}</p>
                      <p className="text-[10px] text-zinc-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "tickers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-400">
                      <th className="text-left pb-2">Ticker</th>
                      <th className="text-right pb-2">Trades</th>
                      <th className="text-right pb-2">Bought</th>
                      <th className="text-right pb-2">Sold</th>
                      <th className="text-right pb-2">Net P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {data.topTickers.map((t) => (
                      <tr key={t.ticker}>
                        <td className="py-2 font-semibold text-zinc-900 dark:text-white">{t.ticker}</td>
                        <td className="py-2 text-right text-zinc-400">{t.trades}</td>
                        <td className="py-2 text-right text-zinc-500">{fmt(t.totalBought)}</td>
                        <td className="py-2 text-right text-zinc-500">{fmt(t.totalSold)}</td>
                        <td className={`py-2 text-right font-bold ${t.netPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                          {t.netPnL >= 0 ? "+" : ""}{fmt(t.netPnL)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
