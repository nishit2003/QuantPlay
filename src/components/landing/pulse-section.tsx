"use client";

import { m } from "framer-motion";
import { PULSE_SECTION } from "@/lib/constants/landing-data";
import { SectionEyebrow } from "./section-eyebrow";

const { eyebrow, title, desc, newsItems, earnings, economic } = PULSE_SECTION;

const IMPACT_TONE: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400",
};

export function PulseSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <SectionEyebrow eyebrow={eyebrow} title={title} desc={desc} />

      <div className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-3">
        {/* News */}
        <PulseCard label="News" delay={0}>
          <ul className="space-y-3">
            {newsItems.map((n) => (
              <li
                key={n.title}
                className="rounded-xl border border-zinc-100 bg-white p-4 transition-colors hover:border-emerald-500/30 dark:border-white/5 dark:bg-white/[0.02]"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {n.tag}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500">{n.time}</span>
                </div>
                <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
                  {n.title}
                </p>
              </li>
            ))}
          </ul>
        </PulseCard>

        {/* Earnings */}
        <PulseCard label="Earnings calendar" delay={0.1}>
          <ul className="space-y-2.5">
            {earnings.map((e) => (
              <li
                key={e.ticker}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    {e.ticker}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {e.date} · {e.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    EPS est.
                  </p>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    ${e.eps.toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </PulseCard>

        {/* Economic events */}
        <PulseCard label="Economic events" delay={0.2}>
          <ul className="space-y-2.5">
            {economic.map((e) => (
              <li
                key={e.event}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]"
              >
                <div className="min-w-0 pr-3">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {e.event}
                  </p>
                  <p className="text-[11px] text-zinc-500">{e.date}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    IMPACT_TONE[e.impact] ?? IMPACT_TONE.Low
                  }`}
                >
                  {e.impact}
                </span>
              </li>
            ))}
          </ul>
        </PulseCard>
      </div>
    </section>
  );
}

function PulseCard({
  label,
  delay,
  children,
}: {
  label: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-zinc-200/70 bg-zinc-50/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]"
    >
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      {children}
    </m.div>
  );
}
