"use client";

import { LazyMotion, domAnimation } from "framer-motion";

import { AmbientBackground } from "@/components/landing/ambient-background";
import { FloatingHeader } from "@/components/landing/floating-header";
import { Hero } from "@/components/landing/hero";
import { DualAudience } from "@/components/landing/dual-audience";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { JournalSection } from "@/components/landing/journal-section";
import { PulseSection } from "@/components/landing/pulse-section";
import { CompeteSection } from "@/components/landing/compete-section";
import { AchievementsSection } from "@/components/landing/achievements-section";
import { AcademySection } from "@/components/landing/academy-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

/**
 * QuantPlay homepage — an Apple-style scroll narrative.
 * Each section is a self-contained component so the story is readable
 * top-to-bottom and content stays DRY in landing-data.ts.
 */
export default function HomePage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-zinc-50 font-sans text-zinc-900 transition-colors duration-500 selection:bg-emerald-500/30 dark:bg-[#050505] dark:text-white">
        <AmbientBackground />
        <FloatingHeader />

        <main className="relative z-10 flex w-full flex-col">
          <Hero />

          <section id="audience">
            <DualAudience />
          </section>

          <section id="platform">
            <FeatureShowcase />
          </section>

          <section id="journal">
            <JournalSection />
          </section>

          <section id="pulse">
            <PulseSection />
          </section>

          <section id="compete">
            <CompeteSection />
          </section>

          <section id="achievements">
            <AchievementsSection />
          </section>

          <section id="academy">
            <AcademySection />
          </section>

          <StatsSection />
          <FinalCta />
          <LandingFooter />
        </main>
      </div>
    </LazyMotion>
  );
}
