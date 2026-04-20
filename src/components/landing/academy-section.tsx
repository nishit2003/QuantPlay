"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ACADEMY_SECTION } from "@/lib/constants/landing-data";
import { SectionEyebrow } from "./section-eyebrow";

const { eyebrow, title, desc, modules } = ACADEMY_SECTION;

const LEVEL_TONE: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  Advanced: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
};

export function AcademySection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <SectionEyebrow eyebrow={eyebrow} title={title} desc={desc} />

      <div className="mx-auto mt-16 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod, i) => (
          <m.div
            key={mod.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/learn/${mod.slug}`}
              className="group relative block h-full overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-7 transition-colors hover:border-emerald-500/40 dark:border-white/10 dark:bg-[#0a0a0a] dark:hover:border-emerald-400/40"
            >
              <div
                className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${mod.tone} blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{mod.icon}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      LEVEL_TONE[mod.level]
                    }`}
                  >
                    {mod.level}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {mod.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {mod.blurb}
                </p>
                <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
                  <span>{mod.readTime} read</span>
                  <span className="font-semibold text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400">
                    Start →
                  </span>
                </div>
              </div>
            </Link>
          </m.div>
        ))}
      </div>
    </section>
  );
}
