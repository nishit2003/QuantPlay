"use client";

/**
 * Static, illustrative mockups for the sticky-scroll showcase. Pure SVG/CSS
 * — no real data, no fetches, no SSR cost.
 */

export function TradeMockup() {
  return (
    <div className="flex h-full w-full flex-col p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Portfolio</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            $142,894.52
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          +12.4%
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/60 dark:border-white/5 dark:bg-white/[0.02]">
        <svg
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="tradeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,180 L80,170 L160,140 L240,150 L320,110 L400,90 L480,100 L560,70 L640,50 L720,40 L800,20"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0,180 L80,170 L160,140 L240,150 L320,110 L400,90 L480,100 L560,70 L640,50 L720,40 L800,20 L800,240 L0,240 Z"
            fill="url(#tradeGlow)"
          />
        </svg>
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1 rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">AAPL</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">$232.14</p>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+1.42%</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20">
          Buy
        </button>
        <button className="rounded-xl border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
          Sell
        </button>
      </div>
    </div>
  );
}

export function AutoInvestMockup() {
  return (
    <div className="flex h-full w-full flex-col p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
        New recurring order
      </p>
      <div className="space-y-4">
        <Field label="Ticker" value="AAPL" mono />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" value="$100.00" mono />
          <Field label="Frequency" value="Weekly" />
        </div>
        <Field label="Next run" value="Mon · 09:30 ET" />
      </div>
      <button className="mt-6 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20">
        Create plan
      </button>
      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            12 weeks projected
          </p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">+$1,240</p>
        </div>
      </div>
    </div>
  );
}

export function ScreenerMockup() {
  const rows = [
    { sym: "NVDA", name: "NVIDIA", price: 875.30, chg: 3.18, mc: "2.1T" },
    { sym: "AAPL", name: "Apple", price: 232.14, chg: 1.42, mc: "3.4T" },
    { sym: "MSFT", name: "Microsoft", price: 428.91, chg: 0.87, mc: "3.2T" },
    { sym: "TSLA", name: "Tesla", price: 248.50, chg: -2.04, mc: "790B" },
    { sym: "META", name: "Meta", price: 512.66, chg: 2.31, mc: "1.3T" },
  ];
  return (
    <div className="flex h-full w-full flex-col p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Screener</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {["Tech", "Mega cap", "Gainers"].map((f) => (
          <span
            key={f}
            className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900"
          >
            {f}
          </span>
        ))}
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-600 dark:border-white/10 dark:text-zinc-400">
          P/E &lt; 30
        </span>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-100 dark:border-white/5">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-zinc-100 bg-zinc-50/70 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-white/5 dark:bg-white/[0.02]">
          <span>Symbol</span>
          <span>Price</span>
          <span>Chg</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.sym}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 last:border-0 dark:border-white/5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">{r.sym}</p>
              <p className="truncate text-[11px] text-zinc-500">{r.name} · {r.mc}</p>
            </div>
            <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
              ${r.price.toFixed(2)}
            </p>
            <p
              className={`font-mono text-sm font-semibold ${
                r.chg >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {r.chg >= 0 ? "+" : ""}
              {r.chg.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsMockup() {
  const alerts = [
    { sym: "AAPL", dir: "above", target: 240, status: "armed" },
    { sym: "TSLA", dir: "below", target: 230, status: "triggered" },
    { sym: "NVDA", dir: "above", target: 900, status: "armed" },
  ];
  return (
    <div className="flex h-full w-full flex-col p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Price alerts</p>
      <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Notify me when
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-zinc-900 dark:text-white">
              AAPL <span className="text-emerald-600 dark:text-emerald-400">crosses above</span> $240.00
            </p>
          </div>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
            Arm
          </button>
        </div>
      </div>
      <div className="flex-1 space-y-2.5 overflow-hidden">
        {alerts.map((a) => {
          const triggered = a.status === "triggered";
          return (
            <div
              key={a.sym}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                triggered
                  ? "border-emerald-500/30 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10"
                  : "border-zinc-100 bg-white dark:border-white/5 dark:bg-white/[0.02]"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{a.sym}</p>
                <p className="text-[11px] text-zinc-500">
                  {a.dir} ${a.target.toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  triggered
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300"
                }`}
              >
                {a.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      <div
        className={`mt-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white ${
          mono ? "font-mono font-semibold" : "font-medium"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
