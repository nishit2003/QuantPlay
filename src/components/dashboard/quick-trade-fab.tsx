"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SearchResult {
  symbol: string;
  shortName: string;
  exchange: string;
}

export function QuickTradeFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Hide on trade page (redundant search)
  const hideFAB = pathname.startsWith("/trade");

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => search(query.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function selectSymbol(symbol: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/trade?symbol=${symbol}`);
  }

  if (hideFAB) return null;

  return (
    <>
      {/* FAB button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-30 right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all active:scale-90 touch-manipulation hover:shadow-xl hover:shadow-emerald-500/40"
        aria-label="Quick trade"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
      </button>

      {/* Bottom sheet */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
            aria-hidden
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden animate-in slide-in-from-bottom duration-300">
            <div className="rounded-t-2xl border-t border-zinc-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-700 dark:bg-zinc-900 shadow-2xl">
              {/* Handle */}
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <h3 className="mb-3 text-sm font-bold text-zinc-900 dark:text-white">Quick Trade</h3>

              {/* Search */}
              <div className="relative mb-2">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ticker or company..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {results.length === 0 && query.trim() && !searching && (
                  <p className="py-6 text-center text-sm text-zinc-400">No results</p>
                )}
                {results.map((r) => (
                  <button
                    key={r.symbol}
                    type="button"
                    onClick={() => selectSymbol(r.symbol)}
                    className="flex w-full items-center justify-between px-2 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition touch-manipulation"
                  >
                    <div>
                      <span className="font-semibold text-sm text-zinc-900 dark:text-white">{r.symbol}</span>
                      <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">{r.shortName}</span>
                    </div>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {r.exchange}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
