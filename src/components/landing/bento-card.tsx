"use client";

import { cn } from "@/lib/utils";
import { m } from "framer-motion";

interface BentoCardProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export function BentoCard({ className, children, delay = 0 }: BentoCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2rem]",
        "border border-zinc-200/80 bg-white shadow-xl shadow-zinc-200/30",
        "dark:border-white/10 dark:bg-[#0a0a0a] dark:shadow-black/50",
        "transition-colors duration-500 hover:border-emerald-500/30 dark:hover:border-emerald-500/50",
        "will-change-transform will-change-opacity",
        className
      )}
      style={{
        transform: "translateZ(0)",
      }}
    >
      {/* Subtle hover gradient bloom */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 transition-colors duration-500 group-hover:from-emerald-50/50 dark:group-hover:from-emerald-500/5" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </m.div>
  );
}
