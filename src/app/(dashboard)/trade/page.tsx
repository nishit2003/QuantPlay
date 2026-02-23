"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { StockChart } from "@/components/trade/stock-chart";

interface SearchResult { symbol: string; shortName: string; exchange: string }

interface StockQuote {
  symbol: string; shortName: string;
  regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number;
  regularMarketPreviousClose: number; regularMarketOpen: number; regularMarketDayHigh: number;
  regularMarketDayLow: number; regularMarketVolume: number;
  marketCap: number | null; trailingPE: number | null; forwardPE: number | null;
  epsTrailingTwelveMonths: number | null; priceToBook: number | null;
  fiftyTwoWeekHigh: number | null; fiftyTwoWeekLow: number | null;
  fiftyDayAverage: number | null; twoHundredDayAverage: number | null;
  averageDailyVolume3Month: number | null; dividendYield: number | null;
  sharesOutstanding: number | null;
}

interface CompanyProfile {
  sector: string; industry: string; longBusinessSummary: string;
  website: string; fullTimeEmployees: number | null;
}

interface AnalystRating {
  strongBuy: number; buy: number; hold: number; sell: number; strongSell: number;
  targetMeanPrice: number | null; targetHighPrice: number | null; targetLowPrice: number | null;
  numberOfAnalysts: number | null;
}

interface NewsItem { title: string; publisher: string; link: string; publishedAt: string }

interface MarketIndex { symbol: string; name: string; price: number; change: number; changePercent: number }
interface DiscoveryStock { symbol: string; shortName: string; price: number; change: number; changePercent: number; volume: number; marketCap: number | null }
interface Discovery { indices: MarketIndex[]; gainers: DiscoveryStock[]; losers: DiscoveryStock[]; mostActive: DiscoveryStock[]; mostVolatile: DiscoveryStock[]; trending: DiscoveryStock[] }

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}
function fmtP(n: number | null | undefined): string { return n != null ? `$${n.toFixed(2)}` : "—"; }
function fmtR(n: number | null | undefined): string { return n != null ? n.toFixed(2) : "—"; }
function fmtPct(n: number | null | undefined): string { return n != null ? `${(n * 100).toFixed(2)}%` : "—"; }

function ChangeDisplay({ change, pct, size = "sm" }: { change: number; pct: number; size?: "sm" | "xs" }) {
  const up = change >= 0;
  const base = size === "sm" ? "text-sm font-semibold" : "text-xs font-medium";
  return (
    <span className={`${base} ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
      {up ? "+" : ""}{change.toFixed(2)} ({up ? "+" : ""}{pct.toFixed(2)}%)
    </span>
  );
}

export default function TradePage() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") ?? "";

  const [query, setQuery] = useState(initialSymbol);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<StockQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Company data
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [analystRating, setAnalystRating] = useState<AnalystRating | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  // Watchlist
  const [inWatchlist, setInWatchlist] = useState(false);

  // Discovery
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trending" | "gainers" | "losers" | "active" | "volatile">("trending");

  // Order state
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [executionType, setExecutionType] = useState<"MARKET" | "LIMIT" | "STOP_LOSS">("MARKET");
  const [orderMode, setOrderMode] = useState<"SHARES" | "DOLLARS">("SHARES");
  const [quantity, setQuantity] = useState("");
  const [dollarAmount, setDollarAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [executing, setExecuting] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const skipNextShowResultsRef = useRef(false);

  // Keyboard: "/" to focus search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fetch discovery on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/market/discover");
        if (res.ok) setDiscovery(await res.json());
      } catch { /* ignore */ }
      finally { setDiscoveryLoading(false); }
    })();
  }, []);

  // Search
  useEffect(() => {
    if (query.length < 1) { setResults([]); setShowResults(false); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        if (!skipNextShowResultsRef.current) setShowResults(true);
        skipNextShowResultsRef.current = false;
      } catch { setResults([]); skipNextShowResultsRef.current = false; }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const selectSymbol = useCallback(async (symbol: string) => {
    setShowResults(false);
    skipNextShowResultsRef.current = true;
    setQuery(symbol);
    setLoadingQuote(true);
    setTradeMessage(null);
    setProfile(null);
    setAnalystRating(null);
    setNews([]);

    try {
      const [quoteRes, profileRes, newsRes] = await Promise.all([
        fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`),
        fetch(`/api/market/profile?symbol=${encodeURIComponent(symbol)}`),
        fetch(`/api/market/news?symbol=${encodeURIComponent(symbol)}`),
      ]);

      const quoteData = await quoteRes.json();
      const profileData = await profileRes.json();
      const newsData = await newsRes.json();

      if (quoteData.quote) setSelectedQuote(quoteData.quote);
      else setTradeMessage({ type: "error", text: quoteData.error });

      setProfile(profileData.profile ?? null);
      setAnalystRating(profileData.analystRating ?? null);
      setNews(newsData.news ?? []);

      try {
        const watchRes = await fetch("/api/watchlist");
        if (watchRes.ok) {
          const watchData = await watchRes.json();
          setInWatchlist((watchData.items ?? []).some((i: { tickerSymbol: string }) => i.tickerSymbol === symbol.toUpperCase()));
        }
      } catch { /* watchlist is non-critical */ }
    } catch {
      setTradeMessage({ type: "error", text: "Failed to load data." });
    } finally {
      setLoadingQuote(false);
    }
  }, []);

  useEffect(() => {
    if (initialSymbol) selectSymbol(initialSymbol);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSymbolRef = useRef<string | null>(null);
  selectedSymbolRef.current = selectedQuote?.symbol ?? null;

  // Live price refresh every 30s when a symbol is selected (free data, not real-time tick)
  useEffect(() => {
    if (!selectedQuote?.symbol) return;
    const interval = setInterval(async () => {
      const sym = selectedSymbolRef.current;
      if (!sym) return;
      try {
        const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(sym)}`);
        const data = await res.json();
        if (data.quote) setSelectedQuote(data.quote);
      } catch { /* ignore */ }
    }, 30_000);
    return () => clearInterval(interval);
  }, [selectedQuote?.symbol]);

  async function toggleWatchlist() {
    if (!selectedQuote) return;
    if (inWatchlist) {
      await fetch(`/api/watchlist?symbol=${selectedQuote.symbol}`, { method: "DELETE" });
    } else {
      await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol: selectedQuote.symbol }) });
    }
    setInWatchlist(!inWatchlist);
  }

  async function executeTrade() {
    if (!selectedQuote) return;
    setExecuting(true);
    setTradeMessage(null);

    try {
      if (executionType === "MARKET") {
        const body: Record<string, unknown> = { symbol: selectedQuote.symbol, type: orderType, mode: orderMode };
        if (orderMode === "SHARES") {
          body.quantity = parseFloat(quantity);
          if (!body.quantity || (body.quantity as number) <= 0) { setTradeMessage({ type: "error", text: "Enter a valid quantity" }); setExecuting(false); return; }
        } else {
          body.dollarAmount = parseFloat(dollarAmount);
          if (!body.dollarAmount || (body.dollarAmount as number) <= 0) { setTradeMessage({ type: "error", text: "Enter a valid dollar amount" }); setExecuting(false); return; }
        }
        const res = await fetch("/api/trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (res.ok) { setTradeMessage({ type: "success", text: data.message }); setQuantity(""); setDollarAmount(""); }
        else setTradeMessage({ type: "error", text: data.error });
      } else {
        const lp = parseFloat(limitPrice);
        if (!lp || lp <= 0) { setTradeMessage({ type: "error", text: "Enter a valid target price" }); setExecuting(false); return; }
        const body: Record<string, unknown> = {
          symbol: selectedQuote.symbol, type: orderType, orderType: executionType,
          targetPrice: lp, mode: orderMode,
        };
        if (orderMode === "SHARES") body.quantity = parseFloat(quantity);
        else body.dollarAmount = parseFloat(dollarAmount);
        const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (res.ok) { setTradeMessage({ type: "success", text: data.message }); setQuantity(""); setDollarAmount(""); setLimitPrice(""); }
        else setTradeMessage({ type: "error", text: data.error });
      }
    } catch {
      setTradeMessage({ type: "error", text: "Trade failed." });
    } finally {
      setExecuting(false);
    }
  }

  const price = selectedQuote?.regularMarketPrice ?? 0;
  const estimatedShares = orderMode === "DOLLARS" && price > 0 ? (parseFloat(dollarAmount || "0") / price) : 0;
  const estimatedCost = orderMode === "SHARES" ? price * parseFloat(quantity || "0") : parseFloat(dollarAmount || "0");

  const stats = selectedQuote ? [
    { l: "Open", v: fmtP(selectedQuote.regularMarketOpen) },
    { l: "Prev Close", v: fmtP(selectedQuote.regularMarketPreviousClose) },
    { l: "Day High", v: fmtP(selectedQuote.regularMarketDayHigh) },
    { l: "Day Low", v: fmtP(selectedQuote.regularMarketDayLow) },
    { l: "Volume", v: fmt(selectedQuote.regularMarketVolume) },
    { l: "Avg Volume", v: fmt(selectedQuote.averageDailyVolume3Month) },
    { l: "Market Cap", v: fmt(selectedQuote.marketCap) },
    { l: "P/E (TTM)", v: fmtR(selectedQuote.trailingPE) },
    { l: "P/E (FWD)", v: fmtR(selectedQuote.forwardPE) },
    { l: "EPS", v: fmtP(selectedQuote.epsTrailingTwelveMonths) },
    { l: "52W High", v: fmtP(selectedQuote.fiftyTwoWeekHigh) },
    { l: "52W Low", v: fmtP(selectedQuote.fiftyTwoWeekLow) },
    { l: "50D Avg", v: fmtP(selectedQuote.fiftyDayAverage) },
    { l: "200D Avg", v: fmtP(selectedQuote.twoHundredDayAverage) },
    { l: "Div Yield", v: fmtPct(selectedQuote.dividendYield) },
    { l: "P/B", v: fmtR(selectedQuote.priceToBook) },
  ] : [];

  const totalAnalyst = analystRating ? analystRating.strongBuy + analystRating.buy + analystRating.hold + analystRating.sell + analystRating.strongSell : 0;

  const tabStocks: DiscoveryStock[] = discovery
    ? activeTab === "trending" ? discovery.trending
      : activeTab === "gainers" ? discovery.gainers
        : activeTab === "losers" ? discovery.losers
          : activeTab === "active" ? discovery.mostActive
            : discovery.mostVolatile
    : [];

  const tabs = [
    { key: "trending" as const, label: "Trending", icon: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" },
    { key: "gainers" as const, label: "Top Gainers", icon: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" },
    { key: "losers" as const, label: "Top Losers", icon: "M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" },
    { key: "active" as const, label: "Most Active", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
    { key: "volatile" as const, label: "Most Volatile", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" },
  ];

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input ref={searchInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search ticker or company — AAPL, Tesla, MSFT... (press / to focus)"
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition"
          />
          {searching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>}
        </div>
        {showResults && results.length > 0 && (!selectedQuote || query.trim().toUpperCase() !== selectedQuote.symbol) && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            {results.map((r) => (
              <button key={r.symbol} onMouseDown={() => selectSymbol(r.symbol)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 first:rounded-t-xl last:rounded-b-xl dark:hover:bg-zinc-800 transition">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">{r.symbol}</span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">{r.shortName}</span>
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{r.exchange}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loadingQuote && (
        <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-16 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
        </div>
      )}

      {/* ───── DISCOVERY VIEW (no stock selected) ───── */}
      {!loadingQuote && !selectedQuote && (
        <div className="space-y-5">
          {/* Market Indices Banner */}
          {discoveryLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="mt-2 h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="mt-1 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          ) : discovery && discovery.indices.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {discovery.indices.map((idx) => {
                const up = idx.change >= 0;
                return (
                  <div key={idx.symbol} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{idx.name}</p>
                    <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                      {idx.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <svg className={`h-3 w-3 ${up ? "text-emerald-500" : "text-red-500"}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d={up ? "M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042.815a.75.75 0 0 1-.53-.919Z" : "M12.577 15.122a.75.75 0 0 1-.53-.919l.815-3.042a20.923 20.923 0 0 1-5.545 4.931l3.074-3.073a.75.75 0 0 0-1.06 0L4.08 18.27a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0L13.06 15.6a19.407 19.407 0 0 0 5.594-5.203.75.75 0 0 1 1.139-.093l-4.78 1.281a.75.75 0 0 1-.919.531l-1.281-4.78a.75.75 0 0 1 1.449.387Z"} clipRule="evenodd" />
                      </svg>
                      <ChangeDisplay change={idx.change} pct={idx.changePercent} size="xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category tabs + stock list */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Tab row */}
            <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-xs font-semibold transition ${
                    activeTab === tab.key
                      ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Stock list */}
            {discoveryLoading ? (
              <div className="space-y-3 p-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex animate-pulse items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                      <div>
                        <div className="h-3.5 w-14 rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="mt-1 h-2.5 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-3.5 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="mt-1 h-2.5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tabStocks.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tabStocks.map((stock) => {
                  const up = stock.change >= 0;
                  return (
                    <button key={stock.symbol} onClick={() => selectSymbol(stock.symbol)}
                      className="flex w-full items-center justify-between px-5 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${up ? "bg-emerald-600" : "bg-red-500"}`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{stock.symbol}</p>
                          <p className="max-w-[180px] truncate text-xs text-zinc-500 dark:text-zinc-400">{stock.shortName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        {activeTab === "active" && (
                          <span className="hidden text-xs text-zinc-400 sm:block">Vol: {fmt(stock.volume)}</span>
                        )}
                        {stock.marketCap && activeTab !== "active" && (
                          <span className="hidden text-xs text-zinc-400 sm:block">{fmt(stock.marketCap)}</span>
                        )}
                        <div className="text-right">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">${stock.price.toFixed(2)}</p>
                          <ChangeDisplay change={stock.change} pct={stock.changePercent} size="xs" />
                        </div>
                        <div className={`hidden w-20 rounded-lg px-2.5 py-1.5 text-center text-xs font-bold text-white sm:block ${up ? "bg-emerald-600" : "bg-red-500"}`}>
                          {up ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-zinc-400">No data available</div>
            )}
          </div>

          {/* Quick pick chips */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
              Popular Stocks
            </h3>
            <div className="flex flex-wrap gap-2">
              {["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","NFLX","AMD","DIS","BA","UBER","COIN","PLTR","SOFI"].map((s) => (
                <button key={s} onClick={() => selectSymbol(s)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors at a glance */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Top Gainers mini card */}
            {discovery && discovery.gainers.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Top Gainers</h3>
                </div>
                <div className="space-y-2">
                  {discovery.gainers.slice(0, 4).map((s) => (
                    <button key={s.symbol} onClick={() => selectSymbol(s.symbol)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{s.symbol}</span>
                        <span className="text-xs text-zinc-400">${s.price.toFixed(2)}</span>
                      </div>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">+{s.changePercent.toFixed(2)}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Top Losers mini card */}
            {discovery && discovery.losers.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Top Losers</h3>
                </div>
                <div className="space-y-2">
                  {discovery.losers.slice(0, 4).map((s) => (
                    <button key={s.symbol} onClick={() => selectSymbol(s.symbol)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{s.symbol}</span>
                        <span className="text-xs text-zinc-400">${s.price.toFixed(2)}</span>
                      </div>
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">{s.changePercent.toFixed(2)}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      {!loadingQuote && selectedQuote && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Left column */}
          <div className="xl:col-span-2 space-y-5">
            {/* Stock header + chart */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-1 flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedQuote.symbol}</h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{selectedQuote.shortName}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Updates every 30s</span>
                <button onClick={toggleWatchlist} className="ml-auto rounded-lg p-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800" title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}>
                  <svg className={`h-5 w-5 ${inWatchlist ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" fill={inWatchlist ? "currentColor" : "none"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </button>
              </div>
              <StockChart symbol={selectedQuote.symbol} currentPrice={selectedQuote.regularMarketPrice} />
            </div>

            {/* Key stats */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Key Statistics</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.l}>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{s.l}</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Company profile */}
            {profile && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <button onClick={() => setShowProfile(!showProfile)} className="flex w-full items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">About {selectedQuote.symbol}</h3>
                  <svg className={`h-4 w-4 text-zinc-400 transition ${showProfile ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {showProfile && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-3 text-xs">
                      {profile.sector && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">{profile.sector}</span>}
                      {profile.industry && <span className="rounded-full bg-purple-50 px-2.5 py-1 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">{profile.industry}</span>}
                      {profile.fullTimeEmployees && <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{fmt(profile.fullTimeEmployees)} employees</span>}
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-4">{profile.longBusinessSummary}</p>
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">{profile.website}</a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Analyst ratings */}
            {analystRating && totalAnalyst > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Analyst Ratings</h3>
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  {[
                    { count: analystRating.strongBuy, color: "bg-emerald-600" },
                    { count: analystRating.buy, color: "bg-emerald-400" },
                    { count: analystRating.hold, color: "bg-amber-400" },
                    { count: analystRating.sell, color: "bg-red-400" },
                    { count: analystRating.strongSell, color: "bg-red-600" },
                  ].map((seg, i) => seg.count > 0 && (
                    <div key={i} className={`${seg.color}`} style={{ width: `${(seg.count / totalAnalyst) * 100}%` }} />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span>Strong Buy ({analystRating.strongBuy})</span>
                  <span>Buy ({analystRating.buy})</span>
                  <span>Hold ({analystRating.hold})</span>
                  <span>Sell ({analystRating.sell})</span>
                  <span>Strong Sell ({analystRating.strongSell})</span>
                </div>
                {analystRating.targetMeanPrice && (
                  <div className="mt-3 flex gap-4 text-xs">
                    <span className="text-zinc-400">Target: <span className="font-semibold text-zinc-900 dark:text-white">${analystRating.targetMeanPrice.toFixed(2)}</span></span>
                    <span className="text-zinc-400">High: <span className="text-emerald-500">${analystRating.targetHighPrice?.toFixed(2)}</span></span>
                    <span className="text-zinc-400">Low: <span className="text-red-500">${analystRating.targetLowPrice?.toFixed(2)}</span></span>
                  </div>
                )}
              </div>
            )}

            {/* News */}
            {news.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">News</h3>
                <div className="space-y-3">
                  {news.map((n, i) => (
                    <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                      className="block rounded-lg p-2 -mx-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {n.publisher} &middot; {new Date(n.publishedAt).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — order panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Place Order</h3>

              {/* Buy/Sell */}
              <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                {(["BUY", "SELL"] as const).map((t) => (
                  <button key={t} onClick={() => setOrderType(t)}
                    className={`flex-1 rounded-md py-2 text-xs font-bold transition ${orderType === t
                      ? (t === "BUY" ? "bg-emerald-600 text-white" : "bg-red-500 text-white")
                      : "text-zinc-500 dark:text-zinc-400"}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Execution type */}
              <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                {(["MARKET", "LIMIT", "STOP_LOSS"] as const).map((t) => (
                  <button key={t} onClick={() => setExecutionType(t)}
                    className={`flex-1 rounded-md py-1.5 text-[10px] font-bold transition ${
                      executionType === t ? "bg-white shadow-sm text-zinc-900 dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                    }`}>
                    {t === "STOP_LOSS" ? "STOP" : t}
                  </button>
                ))}
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                {(["SHARES", "DOLLARS"] as const).map((m) => (
                  <button key={m} onClick={() => setOrderMode(m)}
                    className={`flex-1 rounded-md py-1.5 text-[10px] font-bold transition ${
                      orderMode === m ? "bg-white shadow-sm text-zinc-900 dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                    }`}>
                    {m === "DOLLARS" ? "$ Dollars" : "Shares"}
                  </button>
                ))}
              </div>

              {/* Price display */}
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Market Price</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">${price.toFixed(2)}</span>
              </div>

              {/* Limit/Stop price */}
              {executionType !== "MARKET" && (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    {executionType === "LIMIT" ? "Limit Price" : "Stop Price"}
                  </label>
                  <input type="number" min="0.01" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="0.00"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                </div>
              )}

              {/* Quantity/Dollar input */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  {orderMode === "SHARES" ? "Shares" : "Dollar Amount"}
                </label>
                {orderMode === "SHARES" ? (
                  <input type="number" min="0.00000001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <input type="number" min="0.01" step="0.01" value={dollarAmount} onChange={(e) => setDollarAmount(e.target.value)} placeholder="0.00"
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-7 pr-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                  </div>
                )}
              </div>

              {/* Estimates */}
              {((orderMode === "SHARES" && quantity) || (orderMode === "DOLLARS" && dollarAmount)) && (
                <div className="space-y-1.5 rounded-lg bg-zinc-50 px-3 py-2.5 text-xs dark:bg-zinc-800/50">
                  {orderMode === "DOLLARS" && estimatedShares > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Est. Shares</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{estimatedShares.toFixed(6)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Est. Total</span>
                    <span className="font-bold text-zinc-900 dark:text-white">${estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Message */}
              {tradeMessage && (
                <div className={`rounded-lg p-2.5 text-xs font-medium ${
                  tradeMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                }`}>{tradeMessage.text}</div>
              )}

              {/* Execute */}
              <button onClick={executeTrade} disabled={executing}
                className={`w-full rounded-lg px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
                  orderType === "BUY" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"
                }`}>
                {executing ? "Executing..." : executionType === "MARKET"
                  ? `${orderType} ${selectedQuote.symbol}`
                  : `Place ${executionType === "STOP_LOSS" ? "Stop" : "Limit"} ${orderType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
