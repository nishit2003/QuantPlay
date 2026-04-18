"use client";

import { useState, useEffect, useCallback } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface QuoteData {
  symbol: string; shortName: string; regularMarketPrice: number; regularMarketChange: number;
  regularMarketChangePercent: number; regularMarketVolume: number; marketCap: number | null;
  trailingPE: number | null; epsTrailingTwelveMonths: number | null; dividendYield: number | null;
  fiftyTwoWeekHigh: number | null; fiftyTwoWeekLow: number | null;
}

interface HistoryPoint { date: string; close: number }

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];
const POPULAR = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX", "AMD", "JPM", "V", "DIS"];

function fmt(n: number | null): string {
  if (n == null) return "—";
  if (Math.abs(n) >= 1e12) return "$" + (n / 1e12).toFixed(1) + "T";
  if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return "$" + n.toLocaleString();
}

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [input, setInput] = useState("");
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [histories, setHistories] = useState<Record<string, HistoryPoint[]>>({});
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("3mo");

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return;
    setLoading(true);
    try {
      // Fetch quotes
      const quotePromises = symbols.map(async (s) => {
        const res = await fetch(`/api/market/quote?symbol=${s}`);
        const data = await res.json();
        return [s, data.quote] as [string, QuoteData | null];
      });
      const quoteResults = await Promise.all(quotePromises);
      const q: Record<string, QuoteData> = {};
      for (const [sym, quote] of quoteResults) { if (quote) q[sym] = quote; }
      setQuotes(q);

      // Fetch histories
      const histPromises = symbols.map(async (s) => {
        const res = await fetch(`/api/market/history?symbol=${s}&range=${range}`);
        const data = await res.json();
        return [s, data.history ?? []] as [string, HistoryPoint[]];
      });
      const histResults = await Promise.all(histPromises);
      const h: Record<string, HistoryPoint[]> = {};
      for (const [sym, hist] of histResults) { h[sym] = hist; }
      setHistories(h);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [symbols, range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function addSymbol() {
    const sym = input.trim().toUpperCase();
    if (sym && symbols.length < 3 && !symbols.includes(sym)) {
      setSymbols([...symbols, sym]);
      setInput("");
    }
  }

  function removeSymbol(s: string) {
    setSymbols(symbols.filter((x) => x !== s));
  }

  // Build normalized % change chart data
  const chartData = (() => {
    if (symbols.length === 0) return [];
    const baseSym = symbols[0];
    const baseHistory = histories[baseSym] ?? [];
    if (baseHistory.length === 0) return [];

    return baseHistory.map((point, i) => {
      const row: Record<string, string | number> = { date: point.date };
      for (const sym of symbols) {
        const hist = histories[sym] ?? [];
        if (hist.length === 0 || i >= hist.length) continue;
        const basePrice = hist[0].close;
        if (basePrice > 0) {
          row[sym] = parseFloat(((hist[i].close / basePrice - 1) * 100).toFixed(2));
        }
      }
      return row;
    });
  })();

  const COMPARE_ROWS = [
    { label: "Price", fn: (q: QuoteData) => `$${q.regularMarketPrice.toFixed(2)}` },
    { label: "Change", fn: (q: QuoteData) => `${q.regularMarketChangePercent >= 0 ? "+" : ""}${q.regularMarketChangePercent.toFixed(2)}%` },
    { label: "Market Cap", fn: (q: QuoteData) => fmt(q.marketCap) },
    { label: "P/E Ratio", fn: (q: QuoteData) => q.trailingPE != null ? q.trailingPE.toFixed(1) : "—" },
    { label: "EPS", fn: (q: QuoteData) => q.epsTrailingTwelveMonths != null ? `$${q.epsTrailingTwelveMonths.toFixed(2)}` : "—" },
    { label: "Volume", fn: (q: QuoteData) => q.regularMarketVolume.toLocaleString() },
    { label: "Div Yield", fn: (q: QuoteData) => q.dividendYield != null ? (q.dividendYield * 100).toFixed(2) + "%" : "—" },
    { label: "52W High", fn: (q: QuoteData) => q.fiftyTwoWeekHigh != null ? `$${q.fiftyTwoWeekHigh.toFixed(2)}` : "—" },
    { label: "52W Low", fn: (q: QuoteData) => q.fiftyTwoWeekLow != null ? `$${q.fiftyTwoWeekLow.toFixed(2)}` : "—" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">Compare Stocks</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">Compare up to 3 stocks side-by-side on price, fundamentals, and performance.</p>
      </div>

      {/* Stock selector */}
      <div className="flex flex-wrap items-center gap-2">
        {symbols.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold"
            style={{ borderColor: COLORS[i], color: COLORS[i] }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            {s}
            <button onClick={() => removeSymbol(s)} className="ml-1 hover:opacity-70 transition">×</button>
          </span>
        ))}
        {symbols.length < 3 && (
          <div className="flex items-center gap-1.5">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addSymbol()}
              placeholder="Add ticker..."
              className="w-28 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
            <button onClick={addSymbol}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">+ Add</button>
          </div>
        )}
      </div>

      {/* Quick picks */}
      <div className="flex flex-wrap gap-1">
        {POPULAR.filter((s) => !symbols.includes(s)).slice(0, 8).map((s) => (
          <button key={s} onClick={() => { if (symbols.length < 3) setSymbols([...symbols, s]); }}
            className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition">
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
        </div>
      )}

      {!loading && symbols.length > 0 && (
        <>
          {/* Performance Chart */}
          {chartData.length > 0 && (
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Relative Performance (%)</h3>
                <div className="flex gap-1">
                  {["1mo", "3mo", "1y"].map((r) => (
                    <button key={r} onClick={() => setRange(r)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        range === r ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}>{r.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: "short", day: "numeric" })} minTickGap={50} />
                    <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} width={45}
                      tickFormatter={(v) => v.toFixed(0) + "%"} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 text-xs">
                          <p className="text-zinc-400 mb-1">{label ? new Date(label as string).toLocaleDateString() : ""}</p>
                          {payload.map((p, i) => (
                            <p key={i} style={{ color: p.color }} className="font-semibold">
                              {p.name}: {(p.value as number) >= 0 ? "+" : ""}{(p.value as number).toFixed(2)}%
                            </p>
                          ))}
                        </div>
                      );
                    }} />
                    <Legend />
                    {symbols.map((sym, i) => (
                      <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">Metric</th>
                  {symbols.map((s, i) => (
                    <th key={s} className="px-4 py-3 text-right text-xs font-semibold" style={{ color: COLORS[i] }}>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        {s}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr>
                  <td className="px-4 py-3 text-xs font-medium text-zinc-500">Company</td>
                  {symbols.map((s) => (
                    <td key={s} className="px-4 py-3 text-right text-sm text-zinc-700 dark:text-zinc-300">{quotes[s]?.shortName ?? "—"}</td>
                  ))}
                </tr>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-xs font-medium text-zinc-500">{row.label}</td>
                    {symbols.map((s) => (
                      <td key={s} className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                        {quotes[s] ? row.fn(quotes[s]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
