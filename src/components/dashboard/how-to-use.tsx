"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const STEPS = [
  {
    title: "Dashboard",
    description: "See your portfolio value, positions, and performance at a glance.",
    href: "/dashboard",
  },
  {
    title: "Trade",
    description: "Search for a stock, view the chart and details, then place a buy or sell order (market or limit).",
    href: "/trade",
  },
  {
    title: "Orders",
    description: "Track pending, filled, and cancelled orders in one place.",
    href: "/orders",
  },
  {
    title: "Watchlist",
    description: "Add symbols you care about and open them quickly from your list.",
    href: "/watchlist",
  },
  {
    title: "Alerts",
    description: "Set price alerts and get notified when a stock hits your target.",
    href: "/alerts",
  },
  {
    title: "Recharge",
    description: "Top up your virtual cash balance anytime to keep paper trading.",
    href: "/recharge",
  },
];

export function HowToUse() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 min-h-[44px] text-[13px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition touch-manipulation"
        aria-label="How to use QuantPlay"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </span>
        <span className="hidden sm:inline">How to use</span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-use-title"
          >
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/60"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
                <h2 id="how-to-use-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
                  How to use QuantPlay
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 touch-manipulation"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
                <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                  QuantPlay is paper trading with virtual cash. Here’s where to do what:
                </p>
                <ul className="space-y-3">
                  {STEPS.map((step, i) => (
                    <li key={step.href}>
                      <Link
                        href={step.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30"
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                            {i + 1}
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-white">{step.title}</span>
                        </span>
                        <p className="mt-1.5 pl-8 text-[13px] text-zinc-600 dark:text-zinc-400">
                          {step.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
