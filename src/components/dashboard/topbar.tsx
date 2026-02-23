import { ThemeToggle } from "@/components/theme-toggle";
import { HowToUse } from "@/components/dashboard/how-to-use";

interface TopbarProps {
  userName: string | null;
  virtualCashBalance: number | string;
}

export function Topbar({ userName, virtualCashBalance }: TopbarProps) {
  const balance = Number(virtualCashBalance);

  return (
    <header className="sticky top-0 z-20 flex h-14 min-h-[52px] items-center justify-between border-b border-zinc-200 bg-white/90 pl-16 pr-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 lg:pl-6 sm:pr-6">
      <p className="min-w-0 truncate text-[13px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
        <span className="font-semibold text-zinc-900 dark:text-white">{userName ?? "Trader"}</span>
      </p>
      {/* Spacer on mobile since username is hidden */}
      <div className="sm:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <HowToUse />
        <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-2.5 py-2 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 sm:gap-2 sm:px-3">
          <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80 sm:inline">Cash</span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <ThemeToggle />

        {/* User avatar — touch-friendly */}
        <div className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-sm">
          {userName?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
