import { PLATFORM_STATS } from "@/lib/constants/landing-data";
import { AnimatedCounter } from "./animated-counter";

export function StatsSection() {
  return (
    <section
      data-testid="stats-grid"
      className="relative border-t border-zinc-200/60 bg-white px-6 py-24 dark:border-white/5 dark:bg-[#050505] sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Proof of scale
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            A platform built to be lived in.
          </h2>
        </div>
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_STATS.map((s) => (
            <div key={s.title} className="flex flex-col gap-3">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                {s.title}
              </dt>
              <dd className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
                <AnimatedCounter
                  target={s.v}
                  suffix={s.suffix}
                  prefix={"prefix" in s && typeof s.prefix === "string" ? s.prefix : ""}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
