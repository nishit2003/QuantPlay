"use client";

import { useEffect, useState, useCallback } from "react";

interface RecurringOrder {
  id: string;
  tickerSymbol: string;
  amount: string;
  frequency: string;
  nextRunAt: string;
  active: boolean;
  createdAt: string;
}

export default function AutoInvestPage() {
  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("WEEKLY");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/recurring");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol || !amount) return;
    setCreating(true);
    setMessage("");
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, amount: parseFloat(amount), frequency }),
      });
      const data = await res.json();
      setMessage(data.message);
      setSymbol("");
      setAmount("");
      fetchOrders();
    } catch {
      setMessage("Failed to create order");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/recurring", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    fetchOrders();
  }

  async function deleteOrder(id: string) {
    await fetch(`/api/recurring?id=${id}`, { method: "DELETE" });
    fetchOrders();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Auto-Invest</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Set up recurring purchases to dollar-cost average into your favorite stocks.
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
          New Recurring Investment
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Ticker</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Amount ($)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25.00"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
        {message && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
        )}
      </div>

      {/* Existing orders */}
      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-5 py-3.5 animate-pulse">
              <div className="space-y-1.5">
                <div className="h-3.5 w-16 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
                <div className="h-2.5 w-32 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-14 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
                <div className="h-7 w-7 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <svg className="h-8 w-8 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">No recurring investments</p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">Create a recurring order above to automatically dollar-cost average into your favorite stocks.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
              Active Recurring Orders ({orders.filter((o) => o.active).length})
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {o.tickerSymbol}
                    {!o.active && (
                      <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        PAUSED
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400">
                    ${Number(o.amount).toFixed(2)} / {o.frequency.toLowerCase()} &middot; Next:{" "}
                    {new Date(o.nextRunAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(o.id, o.active)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      o.active
                        ? "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {o.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
