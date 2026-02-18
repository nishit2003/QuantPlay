"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface WatchlistItem {
  id: string;
  tickerSymbol: string;
  shortName: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  addedAt: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addSymbol, setAddSymbol] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addSymbol.trim()) return;
    setAdding(true);
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: addSymbol.trim() }),
    });
    setAddSymbol("");
    setAdding(false);
    fetchWatchlist();
  }

  async function handleRemove(symbol: string) {
    await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
    fetchWatchlist();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Watchlist</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Track stocks you&apos;re interested in.</p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={addSymbol}
            onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
            placeholder="Add ticker..."
            className="w-32 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={adding || !addSymbol.trim()}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {adding ? "..." : "Add"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <svg className="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>
          <p className="mt-4 font-medium text-zinc-600 dark:text-zinc-300">Your watchlist is empty</p>
          <p className="mt-1 text-sm text-zinc-400">Add tickers above or star stocks from the trade page.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => {
              const isPositive = (item.change ?? 0) >= 0;
              return (
                <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
                  <Link
                    href={`/trade?symbol=${item.tickerSymbol}`}
                    className="flex items-center gap-3 hover:opacity-80 transition"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.tickerSymbol.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.tickerSymbol}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">{item.shortName}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    {item.price !== null && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </p>
                        <p className={`text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                          {isPositive ? "+" : ""}{(item.change ?? 0).toFixed(2)} ({(item.changePercent ?? 0).toFixed(2)}%)
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemove(item.tickerSymbol)}
                      className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800 transition"
                      title="Remove"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
