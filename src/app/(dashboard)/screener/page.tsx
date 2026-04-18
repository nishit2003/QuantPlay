"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface ScreenerStock {
  symbol: string; shortName: string; price: number; change: number; changePercent: number;
  volume: number; marketCap: number | null; pe: number | null; eps: number | null;
  divYield: number | null; w52High: number | null; w52Low: number | null;
  avgVolume: number | null; sector: string;
}

type SortKey = "symbol" | "price" | "changePercent" | "volume" | "marketCap" | "pe" | "divYield";
type SortDir = "asc" | "desc";

const SECTORS = ["All", "Technology", "Finance", "Healthcare", "Consumer", "Energy", "Communication", "Industrial", "Fintech", "ETF"];

const MARKET_CAP_FILTERS = [
  { label: "All", min: 0, max: Infinity },
  { label: "Mega (>$200B)", min: 200e9, max: Infinity },
  { label: "Large ($10B–$200B)", min: 10e9, max: 200e9 },
  { label: "Mid ($2B–$10B)", min: 2e9, max: 10e9 },
  { label: "Small (<$2B)", min: 0, max: 2e9 },
];

const PRICE_FILTERS = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50–$200", min: 50, max: 200 },
  { label: "$200–$500", min: 200, max: 500 },
  { label: "Over $500", min: 500, max: Infinity },
];

function fmt(n: number | null): string {
  if (n == null) return "—";
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Filters
  const [sector, setSector] = useState("All");
  const [capFilter, setCapFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState(0);
  const [changeFilter, setChangeFilter] = useState<"all" | "gainers" | "losers">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/market/screener");
        const data = await res.json();
        setStocks(data.stocks ?? []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = stocks;
    if (sector !== "All") list = list.filter((s) => s.sector === sector);
    const cap = MARKET_CAP_FILTERS[capFilter];
    list = list.filter((s) => (s.marketCap ?? 0) >= cap.min && (s.marketCap ?? 0) < cap.max);
    const price = PRICE_FILTERS[priceFilter];
    list = list.filter((s) => s.price >= price.min && s.price < price.max);
    if (changeFilter === "gainers") list = list.filter((s) => s.changePercent > 0);
    if (changeFilter === "losers") list = list.filter((s) => s.changePercent < 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.symbol.toLowerCase().includes(q) || s.shortName.toLowerCase().includes(q));
    }
    return list;
  }, [stocks, sector, capFilter, priceFilter, changeFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <svg className="h-3 w-3 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>;
    return <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={sortDir === "asc" ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} /></svg>;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">Stock Screener</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">Filter and discover stocks across sectors, valuations, and performance.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ticker or name..."
          className="w-full rounded-xl border border-zinc-200/60 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-white transition" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Sector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Sector</label>
          <select value={sector} onChange={(e) => setSector(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Market Cap */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Market Cap</label>
          <select value={capFilter} onChange={(e) => setCapFilter(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {MARKET_CAP_FILTERS.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        {/* Price */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Price</label>
          <select value={priceFilter} onChange={(e) => setPriceFilter(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {PRICE_FILTERS.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        {/* Change */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Performance</label>
          <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {(["all", "gainers", "losers"] as const).map((v) => (
              <button key={v} onClick={() => setChangeFilter(v)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${changeFilter === v ? "bg-white shadow-sm text-zinc-900 dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                {v === "all" ? "All" : v === "gainers" ? "🟢 Up" : "🔴 Down"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">{sorted.length} stocks found</p>
        <button onClick={() => { setSector("All"); setCapFilter(0); setPriceFilter(0); setChangeFilter("all"); setSearch(""); }}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium dark:text-emerald-400">Clear filters</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-16 text-center text-sm text-zinc-400">No stocks match your filters</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50">
                {([
                  ["symbol", "Ticker"], ["price", "Price"], ["changePercent", "Change"],
                  ["volume", "Volume"], ["marketCap", "Market Cap"], ["pe", "P/E"], ["divYield", "Div Yield"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition select-none"
                    onClick={() => toggleSort(key)}>
                    <span className="flex items-center gap-1">{label}<SortIcon col={key} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sorted.map((s) => {
                const up = s.changePercent >= 0;
                const w52 = s.w52High && s.w52Low ? ((s.price - s.w52Low) / (s.w52High - s.w52Low)) * 100 : null;
                return (
                  <tr key={s.symbol} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <td className="px-4 py-3">
                      <Link href={`/trade?symbol=${s.symbol}`} className="flex items-center gap-2.5 group">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white ${up ? "bg-emerald-600" : "bg-red-500"}`}>
                          {s.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{s.symbol}</p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-[120px]">{s.shortName}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white tabular-nums">${s.price.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-semibold tabular-nums ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {up ? "+" : ""}{s.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 tabular-nums">{fmt(s.volume)}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 tabular-nums">{fmt(s.marketCap)}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 tabular-nums">{s.pe != null ? s.pe.toFixed(1) : "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 tabular-nums">{s.divYield != null ? (s.divYield * 100).toFixed(2) + "%" : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{s.sector}</span>
                      {w52 !== null && (
                        <div className="mt-1 h-1 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, w52))}%` }} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
