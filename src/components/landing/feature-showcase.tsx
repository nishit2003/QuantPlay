"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { PLATFORM_CAPABILITIES } from "@/lib/constants/landing-data";
import { DeviceFrame } from "./device-frame";
import {
  TradeMockup,
  AutoInvestMockup,
  ScreenerMockup,
  AlertsMockup,
} from "./mockups";

const SCENES = [TradeMockup, AutoInvestMockup, ScreenerMockup, AlertsMockup];

/**
 * Apple-style "pin the visual, scroll the copy" feature explorer.
 *
 * The active scene is decided by ONE IntersectionObserver in the parent:
 * we observe all four blocks and pick whichever has the highest
 * intersectionRatio. This avoids the per-block useInView race that caused
 * scenes to stack/flicker mid-transition.
 *
 * Mobile fallback: each block stacks under its inline mock since pinned
 * scrollytelling doesn't translate to small screens.
 */
export function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    // Track each block's latest ratio, then on every callback pick the best one.
    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }

        let bestIndex = -1;
        let bestRatio = 0;
        blockRefs.current.forEach((el, idx) => {
          if (!el) return;
          const r = ratios.get(el) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestIndex = idx;
          }
        });

        if (bestIndex >= 0) {
          setActive((prev) => (prev === bestIndex ? prev : bestIndex));
        }
      },
      {
        // Only count intersection inside the middle band of the viewport
        // so the active block is the one a reader is actually on.
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    blockRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative px-6 pt-24 sm:pt-32">
      {/* Section intro */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          The platform
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl">
          Everything you need.
          <br />
          <span className="text-zinc-500 dark:text-zinc-500">Nothing you don&apos;t.</span>
        </h2>
      </div>

      {/*
        Sticky math:

          A `position: sticky` child pinned at top-0 with h-screen releases
          when the parent's bottom reaches the sticky element's bottom
          (which is 100vh while pinned).
          ⇒ pinDuration = parentHeight − 100vh.

        With CSS Grid the right column auto-stretches to match the left
        rail's height (default `align-items: stretch`).

          Left rail = 4 blocks × min-h-[80vh] + 100vh trailing = 420vh.
          Sticky panel = 100vh ⇒ pinDuration = 320vh = exactly the
          4 × 80vh read-time of the blocks. Device stays pinned for the
          entire reading.

        We use `top: 0` + `h-screen` + flex centering rather than
        `top: 50%` + `transform: translateY(-50%)` because `transform`
        on a sticky element creates a new containing block and is a
        known sticky disruptor in some browsers.

        Prerequisite: NO ancestor (including <body>) may have non-visible
        overflow, or sticky will use that ancestor as scroll container
        and never activate. See the comment in src/app/layout.tsx.
      */}
      <div className="relative mx-auto mt-12 grid max-w-7xl gap-x-12 md:mt-20 md:grid-cols-2">
        {/* Left rail: scrolling copy */}
        <div className="md:pb-[100vh]">
          {PLATFORM_CAPABILITIES.map((cap, i) => (
            <FeatureBlock
              key={cap.id}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              index={i}
              eyebrow={cap.eyebrow}
              title={cap.title}
              desc={cap.desc}
              href={cap.href}
              MobileScene={SCENES[i]}
              isActive={active === i}
            />
          ))}
        </div>

        {/* Right rail: pinned device.
            AnimatePresence mode="wait" mounts only ONE scene at a time
            so there's never overlap between mockups during transition. */}
        <div className="hidden md:block">
          <div className="sticky top-0 flex h-screen items-center justify-center px-4">
            <DeviceFrame
              label={PLATFORM_CAPABILITIES[active]?.eyebrow ?? ""}
              className="aspect-[4/5] max-h-[78vh] w-full"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-white dark:bg-[#0a0a0a]"
                >
                  {(() => {
                    const Scene = SCENES[active];
                    return <Scene />;
                  })()}
                </m.div>
              </AnimatePresence>
            </DeviceFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureBlockProps {
  ref: (el: HTMLDivElement | null) => void;
  index: number;
  eyebrow: string;
  title: string;
  desc: string;
  href: string;
  MobileScene: React.ComponentType;
  isActive: boolean;
}

function FeatureBlock({
  ref,
  index,
  eyebrow,
  title,
  desc,
  href,
  MobileScene,
  isActive,
}: FeatureBlockProps) {
  return (
    <div
      ref={ref}
      // Desktop: each block is 80vh tall with copy vertically centered.
      // The block height (320vh total across 4 blocks) drives sticky
      // duration; see the parent's pinDuration math.
      className={`py-16 transition-opacity duration-500 md:flex md:min-h-[80vh] md:flex-col md:justify-center md:py-8 ${
        isActive ? "opacity-100" : "md:opacity-30"
      }`}
    >
      <div>
        {/* Oversized index numeral fills vertical space visually so the
            block doesn't feel hollow. Apple uses a similar pattern on
            product pages. */}
        <div className="flex items-baseline gap-4">
          <span
            aria-hidden
            className="text-6xl font-bold tracking-tighter text-zinc-300 dark:text-zinc-700 sm:text-7xl md:text-8xl"
          >
            0{index + 1}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            {eyebrow}
          </span>
        </div>
        <h3 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
          {title}
        </h3>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
          {desc}
        </p>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Explore {eyebrow.toLowerCase()}
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Mobile only: inline mockup since the sticky pattern doesn't apply. */}
      <div className="mt-8 md:hidden">
        <DeviceFrame label={eyebrow} className="aspect-[4/5] max-h-[520px]">
          <MobileScene />
        </DeviceFrame>
      </div>
    </div>
  );
}
