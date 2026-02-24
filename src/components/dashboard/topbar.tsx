import { ThemeToggle } from "@/components/theme-toggle";
import { HowToUse } from "@/components/dashboard/how-to-use";
import Link from "next/link";

interface TopbarProps {
  userName: string | null;
  virtualCashBalance: number | string;
}

export function Topbar({ userName, virtualCashBalance }: TopbarProps) {
  const balance = Number(virtualCashBalance);

  return (
    <header className="sticky top-0 z-20 flex h-12 min-h-[48px] items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl backdrop-saturate-150 pl-14 pr-3 dark:border-zinc-800/60 dark:bg-zinc-950/80 lg:h-14 lg:pl-6 sm:pr-5">
      {/* Name — hidden on small mobile */}
      <p className="min-w-0 truncate text-[13px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
        <span className="font-semibold text-zinc-900 dark:text-white">{userName ?? "Trader"}</span>
      </p>
      {/* Spacer on mobile */}
      <div className="sm:hidden" />

      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        <HowToUse />

        {/* Cash badge — compact pill */}
        <div className="flex items-center gap-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1.5 border border-emerald-200/40 dark:border-emerald-800/25 sm:gap-1.5 sm:px-3">
          <span className="hidden text-[9px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 sm:inline">Cash</span>
          <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <ThemeToggle />

        {/* Avatar — links to profile */}
        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 touch-manipulation sm:h-9 sm:w-9 sm:text-sm"
        >
          {userName?.charAt(0)?.toUpperCase() ?? "U"}
        </Link>
      </div>
    </header>
  );
}
