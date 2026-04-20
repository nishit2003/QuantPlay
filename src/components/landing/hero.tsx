"use client";

import Link from "next/link";
import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { SITE_COPY } from "@/lib/constants/landing-data";
import { MarqueeTicker } from "./marquee-ticker";
import { HeroDashboard } from "./hero-dashboard";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  // Parallax tilt + zoom on the dashboard mockup as the user scrolls past hero.
  // Falls back to static under the test mock (useScroll returns get()=>0).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 pb-12 pt-[24vh] sm:pb-20 sm:pt-[28vh]"
    >
      {/* Headline */}
      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300">
            {SITE_COPY.heroEyebrow}
          </span>
        </div>

        <h1 className="mt-8 text-[clamp(3rem,8vw,7rem)] font-bold leading-[1.02] tracking-tight text-zinc-900 dark:text-white">
          {SITE_COPY.heroTitle}
          <br />
          <span className="bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-400 dark:to-teal-400">
            {SITE_COPY.heroTitleAccent}
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
          {SITE_COPY.heroSubtitle}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={SITE_COPY.heroPrimaryCta.href}
            className="rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-900/10 transition-transform hover:scale-[1.04] dark:bg-white dark:text-black sm:text-base"
          >
            {SITE_COPY.heroPrimaryCta.label} →
          </Link>
          <Link
            href={SITE_COPY.heroSecondaryCta.href}
            className="rounded-full border border-zinc-300/80 bg-white/60 px-7 py-3.5 text-sm font-bold text-zinc-900 backdrop-blur-md transition-colors hover:bg-white dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:text-base"
          >
            {SITE_COPY.heroSecondaryCta.label}
          </Link>
        </div>

        <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-500">
          No credit card. Free forever.
        </p>
      </m.div>

      {/* Live in-code dashboard mockup with parallax tilt */}
      <m.div
        style={{ scale, rotateX, opacity, transformPerspective: 1500 }}
        className="relative mx-auto mt-20 max-w-6xl"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/70 p-2 shadow-2xl shadow-zinc-300/50 backdrop-blur-2xl dark:border-white/10 dark:bg-black/60 dark:shadow-black/60 sm:rounded-[2.5rem] sm:p-3">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-[1.6rem] sm:rounded-[2rem]">
            <HeroDashboard />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-[2rem] bg-gradient-to-t from-zinc-50 via-zinc-50/30 to-transparent dark:from-[#050505]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-10 mx-auto h-40 w-3/4 bg-emerald-500/20 blur-[80px] dark:bg-emerald-500/15" />
      </m.div>

      {/* Marquee ticker — gives the page life right after hero */}
      <div className="mt-20">
        <MarqueeTicker />
      </div>
    </section>
  );
}
