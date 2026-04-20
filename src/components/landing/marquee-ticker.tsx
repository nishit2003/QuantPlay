"use client";

import { HERO_TICKERS } from "@/lib/constants/landing-data";

/**
 * Pure CSS marquee (no JS animation = no jank, no SSR cost).
 * The list is duplicated so the translate(-50%) loop is seamless.
 */
export function MarqueeTicker() {
  const items = [...HERO_TICKERS, ...HERO_TICKERS];

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-zinc-200/70 bg-white/40 py-4 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.02]"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-50 to-transparent dark:from-[#050505]"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-50 to-transparent dark:from-[#050505]"
      />
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap will-change-transform">
        {items.map((t, i) => {
          const positive = t.change >= 0;
          return (
            <div
              key={`${t.sym}-${i}`}
              className="flex items-center gap-3 text-sm"
            >
              <span className="font-mono font-bold tracking-tight text-zinc-900 dark:text-white">
                {t.sym}
              </span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`font-mono font-semibold ${
                  positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {positive ? "+" : ""}
                {t.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
