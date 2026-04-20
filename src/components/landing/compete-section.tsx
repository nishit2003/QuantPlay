"use client";

import { m } from "framer-motion";
import { COMPETE_SECTION } from "@/lib/constants/landing-data";
import { DeviceFrame } from "./device-frame";

const { eyebrow, title, desc, rankings } = COMPETE_SECTION;

export function CompeteSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        {/* Visual on left this time, alternating rhythm */}
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 lg:order-1"
        >
          <DeviceFrame label="Weekly contest" className="aspect-[5/4]">
            <div className="flex h-full flex-col p-5">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                    Contest ends
                  </p>
                  <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    Fri · 4:00 PM ET
                  </p>
                </div>
                <Countdown values={["02", "14", "37"]} />
              </div>

              <ul className="flex-1 space-y-2 overflow-hidden">
                {rankings.map((r) => (
                  <li
                    key={r.rank}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      r.isMe
                        ? "border-emerald-500/40 bg-emerald-50 dark:border-emerald-400/40 dark:bg-emerald-500/10"
                        : "border-zinc-100 bg-white dark:border-white/5 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          r.rank === 1
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
                        }`}
                      >
                        {r.badge ?? r.rank}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{r.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          ${r.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{r.returnPct.toFixed(1)}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </DeviceFrame>
        </m.div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">{desc}</p>
        </div>
      </div>
    </section>
  );
}

function Countdown({ values }: { values: string[] }) {
  const labels = ["DAYS", "HRS", "MIN"];
  return (
    <div className="flex gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="rounded-lg bg-white px-2 py-1 text-center shadow-sm dark:bg-zinc-900"
        >
          <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{v}</p>
          <p className="text-[8px] font-semibold tracking-widest text-zinc-500">{labels[i]}</p>
        </div>
      ))}
    </div>
  );
}
