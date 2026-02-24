/** Shimmer skeleton placeholders — drop-in replacements for loading spinners */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 ${className}`}
    />
  );
}

/** Pre-built skeleton row for list items (icon + two lines + right value) */
export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-14 rounded" />
          <Skeleton className="h-2.5 w-24 rounded" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-3.5 w-16 rounded" />
        <Skeleton className="ml-auto h-2.5 w-12 rounded" />
      </div>
    </div>
  );
}

/** Skeleton rows wrapped in a card container */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
