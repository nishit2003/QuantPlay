import Link from "next/link";
import { SITE_COPY } from "@/lib/constants/landing-data";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[120px] dark:bg-emerald-500/10" />

      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl md:text-7xl">
          {SITE_COPY.finalCtaTitle}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
          {SITE_COPY.finalCtaSubtitle}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/sign-up"
            className="rounded-full bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-xl shadow-zinc-900/20 transition-transform hover:scale-[1.04] dark:bg-white dark:text-black"
          >
            {SITE_COPY.finalCtaButton}
          </Link>
          <Link
            href="/learn"
            className="rounded-full border border-zinc-300/80 bg-white/70 px-8 py-4 text-base font-bold text-zinc-900 backdrop-blur-md transition-colors hover:bg-white dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
          >
            Browse the academy
          </Link>
        </div>
      </div>
    </section>
  );
}
