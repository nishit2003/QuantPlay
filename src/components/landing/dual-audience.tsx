"use client";

import { m } from "framer-motion";
import { AUDIENCE_TRACKS } from "@/lib/constants/landing-data";
import { SectionEyebrow } from "./section-eyebrow";

/**
 * "One platform. Two journeys." — split panel that frames the audience.
 * Beginners + serious traders see themselves in the page within the first scroll.
 */
export function DualAudience() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <SectionEyebrow
        eyebrow="Built for everyone"
        title={
          <>
            One platform.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-violet-400 dark:to-blue-400">
              Two journeys.
            </span>
          </>
        }
        desc="Whether you're placing your first trade or stress-testing a strategy, QuantPlay meets you where you are."
      />

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-2">
        {AUDIENCE_TRACKS.map((track, i) => (
          <m.div
            key={track.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-8 shadow-xl shadow-zinc-200/30 transition-colors hover:border-emerald-500/40 dark:border-white/10 dark:bg-[#0a0a0a] dark:shadow-black/50 dark:hover:border-emerald-400/40 sm:p-10"
          >
            <div
              className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${track.accent} blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100`}
            />
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl">{track.icon}</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  {track.label}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {track.headline}
              </h3>
              <ul className="mt-6 space-y-3">
                {track.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                    <svg
                      aria-hidden
                      className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.296a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.086l6.793-6.79a1 1 0 0 1 1.414 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
