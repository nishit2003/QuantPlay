"use client";

import { useMounted } from "@/hooks/use-mounted";

/**
 * Fixed-position ambient layer: radial wash + faint grid + emerald orb.
 * Mounts only after hydration to avoid SSR mismatch on randomized layers.
 */
export function AmbientBackground() {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-200/60 via-zinc-50 to-white dark:from-zinc-900 dark:via-[#050505] dark:to-[#020202]" />
      <div className="absolute inset-0 mix-blend-overlay opacity-40 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/20 opacity-40 blur-[140px] dark:opacity-20" />
      <div className="absolute -left-40 top-[40vh] h-[400px] w-[400px] rounded-full bg-violet-500/10 opacity-50 blur-[120px] dark:bg-violet-500/15 dark:opacity-30" />
      <div className="absolute -right-40 top-[80vh] h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-50 blur-[120px] dark:bg-blue-500/15 dark:opacity-30" />
    </div>
  );
}
