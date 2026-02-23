"use client";

import { useEffect, useState } from "react";
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
          Get notified when a stock hits your target price. Alerts are checked every few minutes.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Add alert</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Symbol</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:w-24 sm:py-2 sm:text-sm" />
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
          <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No alerts yet. Add one above or <Link href="/trade" className="font-semibold text-emerald-600 hover:text-emerald-700">search a stock</Link> to set an alert.
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
