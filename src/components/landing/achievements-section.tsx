"use client";

import { m } from "framer-motion";
import { ACHIEVEMENT_PREVIEW } from "@/lib/constants/landing-data";
import { SectionEyebrow } from "./section-eyebrow";

const { eyebrow, title, desc, badges } = ACHIEVEMENT_PREVIEW;

const RARITY_STYLE = {
  Common: {
    ring: "border-zinc-200 dark:border-white/10",
    bg: "bg-white dark:bg-white/[0.02]",
    label: "text-zinc-500",
    glow: "",
  },
  Rare: {
    ring: "border-blue-300/60 dark:border-blue-400/40",
    bg: "bg-blue-50/70 dark:bg-blue-500/10",
    label: "text-blue-700 dark:text-blue-300",
    glow: "shadow-lg shadow-blue-500/10",
  },
  Epic: {
    ring: "border-violet-300/60 dark:border-violet-400/40",
    bg: "bg-violet-50/70 dark:bg-violet-500/10",
    label: "text-violet-700 dark:text-violet-300",
    glow: "shadow-lg shadow-violet-500/15",
  },
  Legendary: {
    ring: "border-amber-300/70 dark:border-amber-400/50",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/15 dark:to-orange-500/10",
    label: "text-amber-700 dark:text-amber-300",
    glow: "shadow-xl shadow-amber-500/20",
  },
} as const;

export function AchievementsSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <SectionEyebrow eyebrow={eyebrow} title={title} desc={desc} />

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((b, i) => {
          const style = RARITY_STYLE[b.rarity];
          return (
            <m.div
              key={b.title}
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, rotate: 1 }}
              className={`group relative flex flex-col items-center justify-center rounded-3xl border p-6 text-center transition-shadow ${style.ring} ${style.bg} ${style.glow}`}
            >
              <div className="text-4xl">{b.icon}</div>
              <p className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">{b.title}</p>
              <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${style.label}`}>
                {b.rarity}
              </p>
            </m.div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        And 15 more to unlock as you trade, learn, and climb.
      </p>
    </section>
  );
}
