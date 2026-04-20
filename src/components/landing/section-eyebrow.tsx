import { cn } from "@/lib/utils";

/**
 * Tiny shared header used at the top of every narrative section so the
 * Apple-like rhythm (eyebrow → headline → desc) stays consistent.
 */
export function SectionEyebrow({
  eyebrow,
  title,
  desc,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={cn("max-w-3xl", alignClass, className)}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
          {desc}
        </p>
      )}
    </div>
  );
}
