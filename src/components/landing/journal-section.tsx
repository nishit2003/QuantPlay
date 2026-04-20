"use client";

import { m } from "framer-motion";
import { JOURNAL_HIGHLIGHTS } from "@/lib/constants/landing-data";
import { DeviceFrame } from "./device-frame";

const { eyebrow, title, desc, metrics, sectorMix } = JOURNAL_HIGHLIGHTS;

export function JournalSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">{desc}</p>

          <dl className="mt-10 grid grid-cols-2 gap-4 sm:max-w-md">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-zinc-200/70 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  {m.label}
                </dt>
                <dd
                  className={`mt-1 text-xl font-bold tracking-tight ${
                    m.positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-900 dark:text-white"
                  }`}
                >
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <DeviceFrame label="Trade journal" className="aspect-[5/4]">
            <div className="grid h-full grid-cols-3 gap-4 p-5">
              {/* Equity curve */}
              <div className="col-span-2 flex flex-col rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Equity curve
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +24.6% YTD
                  </p>
                </div>
                <div className="relative flex-1">
                  <svg
                    viewBox="0 0 400 160"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <defs>
                      <linearGradient id="journalGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,130 L40,120 L80,125 L120,100 L160,110 L200,80 L240,75 L280,55 L320,60 L360,30 L400,20"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,130 L40,120 L80,125 L120,100 L160,110 L200,80 L240,75 L280,55 L320,60 L360,30 L400,20 L400,160 L0,160 Z"
                      fill="url(#journalGlow)"
                    />
                  </svg>
                </div>
              </div>

              {/* Sector pie */}
              <div className="flex flex-col rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Sectors
                </p>
                <DonutChart slices={sectorMix} />
                <ul className="mt-3 space-y-1.5">
                  {sectorMix.slice(0, 3).map((s) => (
                    <li key={s.name} className="flex items-center gap-2 text-[11px]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="flex-1 truncate text-zinc-600 dark:text-zinc-400">
                        {s.name}
                      </span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {Math.round(s.weight * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent trades */}
              <div className="col-span-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Recent trades
                </p>
                <div className="grid grid-cols-4 gap-3 text-[11px]">
                  {[
                    { sym: "AAPL", side: "BUY", qty: 10, p: 232.14 },
                    { sym: "TSLA", side: "SELL", qty: 5, p: 248.5 },
                    { sym: "NVDA", side: "BUY", qty: 2, p: 875.3 },
                    { sym: "MSFT", side: "BUY", qty: 4, p: 428.91 },
                  ].map((t) => (
                    <div key={t.sym} className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
                      <p className="font-bold text-zinc-900 dark:text-white">{t.sym}</p>
                      <p className={t.side === "BUY" ? "text-emerald-500" : "text-rose-500"}>
                        {t.side} {t.qty}
                      </p>
                      <p className="font-mono text-zinc-500">${t.p.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DeviceFrame>
        </m.div>
      </div>
    </section>
  );
}

function DonutChart({ slices }: { slices: readonly { name: string; weight: number; color: string }[] }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  // Precompute each slice's start offset in a single pass so render stays pure.
  const segments = slices.reduce<{ name: string; color: string; length: number; offset: number }[]>(
    (acc, s) => {
      const length = circumference * s.weight;
      const offset = acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].length;
      acc.push({ name: s.name, color: s.color, length, offset });
      return acc;
    },
    [],
  );

  return (
    <div className="relative mx-auto h-20 w-20">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        {segments.map((seg) => (
          <circle
            key={seg.name}
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="10"
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
    </div>
  );
}
