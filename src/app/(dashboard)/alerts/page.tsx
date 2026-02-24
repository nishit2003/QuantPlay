"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface AlertItem {
  id: string;
  tickerSymbol: string;
  targetPrice: string;
  direction: string;
  triggered: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function fetchAlerts() {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAlerts(); }, []);

  const [results, setResults] = useState<{ symbol: string; shortName: string; exchange: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const skipNextShowResultsRef = useRef(false);

  useEffect(() => {
    if (symbol.length < 1) { setResults([]); setShowResults(false); return; }
    if (skipNextShowResultsRef.current) { skipNextShowResultsRef.current = false; return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(symbol)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setShowResults(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [symbol]);

  function selectSymbol(sym: string) {
    skipNextShowResultsRef.current = true;
    setSymbol(sym);
    setShowResults(false);
    setSearchFocused(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const sym = symbol.trim().toUpperCase();
    const price = parseFloat(targetPrice);
    if (!sym || !price || price <= 0) {
      setMessage({ type: "error", text: "Enter a valid symbol and target price." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym, targetPrice: price, direction }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? "Alert added." });
        setSymbol("");
        setTargetPrice("");
        fetchAlerts();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to add alert." });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    fetchAlerts();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Price alerts</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Get notified when a stock hits your target price.
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong className="font-semibold">Good to know:</strong> Price alerts and email notifications are checked automatically every 60 seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Add alert</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
          <div className="relative z-50">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Symbol</label>
            <div className="relative">
              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)}
                onFocus={() => { if (results.length > 0) setShowResults(true); setSearchFocused(true); }}
                onBlur={() => setTimeout(() => { setShowResults(false); setSearchFocused(false); }, 200)}
                placeholder="AAPL"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:w-48 sm:py-2 sm:text-sm" />
              {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>}
            </div>
            {showResults && results.length > 0 && (
              <div className="absolute z-50 mt-1 w-full sm:w-64 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {results.slice(0, 5).map((r) => (
                  <button key={r.symbol} type="button" onMouseDown={() => selectSymbol(r.symbol)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-50 first:rounded-t-xl last:rounded-b-xl dark:hover:bg-zinc-800 transition">
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-zinc-900 dark:text-white text-sm">{r.symbol}</span>
                      <span className="ml-2 truncate text-xs text-zinc-500 dark:text-zinc-400">{r.shortName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Target price</label>
            <input type="number" min="0.01" step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="150"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:w-28 sm:py-2 sm:text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">When price goes</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as "above" | "below")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:w-auto sm:py-2 sm:text-sm">
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <button type="submit" disabled={submitting}
            className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 touch-manipulation sm:col-span-1 sm:py-2">
            {submitting ? "Adding…" : "Add alert"}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <h2 className="border-b border-zinc-100 px-5 py-4 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">Your alerts</h2>
        {loading ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-14 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                  <div className="h-2.5 w-24 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                </div>
                <div className="h-7 w-16 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <svg className="h-8 w-8 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">No price alerts yet</p>
            <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">Set alerts above to get notified when stocks hit your target price.</p>
            <Link href="/trade" className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition touch-manipulation">
              Search stocks
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">{a.tickerSymbol}</span>
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {a.direction === "above" ? "≥" : "≤"} ${Number(a.targetPrice).toFixed(2)}
                    {a.triggered && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Triggered</span>}
                  </span>
                </div>
                {!a.triggered && (
                  <button type="button" onClick={() => handleDelete(a.id)} className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
