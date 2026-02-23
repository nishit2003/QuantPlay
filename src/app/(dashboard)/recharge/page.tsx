"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface Purchase {
  id: string;
  realAmountPaid: string;
  virtualCashAdded: string;
  status: string;
  createdAt: string;
}

const packages = [
  {
    id: "A",
    label: "Starter",
    price: 2,
    virtual: 100,
    perks: ["$100 virtual cash", "Great for trying out trades", "Instant credit to account"],
    color: "zinc" as const,
  },
  {
    id: "B",
    label: "Pro",
    price: 8,
    virtual: 500,
    perks: ["$500 virtual cash", "Best value per dollar", "Unlock larger positions", "Priority for weekly contests"],
    color: "emerald" as const,
    popular: true,
  },
  {
    id: "C",
    label: "Elite",
    price: 20,
    virtual: 1500,
    perks: ["$1,500 virtual cash", "Maximum buying power", "75x return on investment", "Dominate the leaderboard", "Build a diversified portfolio"],
    color: "violet" as const,
  },
];

export default function RechargePage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const cancelled = searchParams.get("cancelled");

  const [loading, setLoading] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await fetch("/api/recharge/history");
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  async function handleBuy(pkgId: string) {
    setLoading(pkgId);
    try {
      const res = await fetch("/api/recharge/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkgId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  const totalSpent = purchases.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + Number(p.realAmountPaid), 0);
  const totalAdded = purchases.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + Number(p.virtualCashAdded), 0);

  return (
    <div className="space-y-8">
      {/* Stripe disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800/50 dark:bg-amber-900/20">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Stripe payments in progress</p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            We&apos;re still figuring out transactions with Stripe — sorry for the inconvenience. If you want more virtual cash, feel free to reach out and we can add it to your account.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Recharge Your Account</h1>
        <p className="max-w-lg text-sm text-zinc-500 dark:text-zinc-400">
          Power up your paper-trading portfolio with virtual cash. Choose a package below and checkout securely with Stripe.
        </p>
      </div>

      {/* Status banners */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Payment successful!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Your virtual cash has been credited to your account.</p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
            <svg className="h-5 w-5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Payment cancelled</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No charges were made to your card.</p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Purchases</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{purchases.filter((p) => p.status === "COMPLETED").length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Virtual Cash Added</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalAdded.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Pricing cards */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Choose a Package</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {packages.map((pkg) => {
            const isPopular = pkg.popular;
            const isElite = pkg.id === "C";
            const multiplier = pkg.virtual / pkg.price;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                  isPopular
                    ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20 dark:bg-zinc-900 dark:ring-emerald-500/30"
                    : isElite
                      ? "border-violet-500/50 bg-white ring-1 ring-violet-500/10 dark:bg-zinc-900 dark:ring-violet-500/20"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {/* Badge */}
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-600/30">
                    Most Popular
                  </span>
                )}
                {isElite && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-violet-600 to-purple-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md shadow-violet-600/30">
                    Best Value
                  </span>
                )}

                {/* Plan name + multiplier */}
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${
                    isPopular ? "text-emerald-600 dark:text-emerald-400"
                      : isElite ? "text-violet-600 dark:text-violet-400"
                        : "text-zinc-900 dark:text-white"
                  }`}>
                    {pkg.label}
                  </h3>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    isPopular ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : isElite ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {multiplier}x return
                  </span>
                </div>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">${pkg.price}</span>
                  <span className="text-sm font-medium text-zinc-400">USD</span>
                </div>

                {/* Virtual cash highlight */}
                <div className={`mt-4 flex items-center gap-2.5 rounded-xl px-4 py-3 ${
                  isPopular ? "bg-emerald-50 dark:bg-emerald-900/15"
                    : isElite ? "bg-violet-50 dark:bg-violet-900/15"
                      : "bg-zinc-50 dark:bg-zinc-800/50"
                }`}>
                  <svg className={`h-6 w-6 ${
                    isPopular ? "text-emerald-500" : isElite ? "text-violet-500" : "text-zinc-400 dark:text-zinc-500"
                  }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className={`text-xl font-extrabold ${
                      isPopular ? "text-emerald-600 dark:text-emerald-400"
                        : isElite ? "text-violet-600 dark:text-violet-400"
                          : "text-zinc-900 dark:text-white"
                    }`}>
                      ${pkg.virtual.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-400">virtual cash</p>
                  </div>
                </div>

                {/* Perks list */}
                <ul className="mt-5 flex-1 space-y-2.5">
                  {pkg.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isPopular ? "text-emerald-500" : isElite ? "text-violet-500" : "text-zinc-400 dark:text-zinc-500"
                      }`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => handleBuy(pkg.id)}
                  disabled={loading !== null}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
                    isPopular
                      ? "bg-emerald-600 shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-emerald-600/40"
                      : isElite
                        ? "bg-linear-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-600/25 hover:from-violet-700 hover:to-purple-700 hover:shadow-violet-600/40"
                        : "bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  }`}
                >
                  {loading === pkg.id ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirecting to Stripe...
                    </span>
                  ) : (
                    `Get $${pkg.virtual.toLocaleString()} Cash`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">How It Works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { step: "1", title: "Choose a Package", desc: "Pick the virtual cash bundle that fits your trading goals.", icon: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" },
            { step: "2", title: "Secure Checkout", desc: "Pay safely with Stripe. We never store your card details.", icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
            { step: "3", title: "Start Trading", desc: "Virtual cash is instantly added. Start building your portfolio!", icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase history */}
      {purchases.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Purchase History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Virtual Cash</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {purchases.map((p) => (
                  <tr key={p.id} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="whitespace-nowrap px-6 py-3.5 text-zinc-500 dark:text-zinc-400">
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      +${Number(p.virtualCashAdded).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-zinc-600 dark:text-zinc-300">
                      ${Number(p.realAmountPaid).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        p.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : p.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty history state */}
      {purchases.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <svg className="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">No purchases yet</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Pick a package above to get started!</p>
        </div>
      )}
    </div>
  );
}
