import { cn } from "@/lib/utils";

/**
 * Mac-window chrome used to frame all in-page mockups so the visual
 * vocabulary stays consistent across the showcase, journal, news, etc.
 */
export function DeviceFrame({
  label,
  className,
  bodyClassName,
  children,
}: {
  label: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/70 p-2 shadow-2xl shadow-zinc-300/40 backdrop-blur-2xl",
        "dark:border-white/10 dark:bg-black/60 dark:shadow-black/60",
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] border border-zinc-100 bg-white dark:border-white/5 dark:bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-white/60 px-5 py-3 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            {label}
          </div>
          <div className="w-10" />
        </div>
        <div className={cn("relative h-[calc(100%-3rem)] w-full overflow-hidden", bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
