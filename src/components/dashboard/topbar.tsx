import { ThemeToggle } from "@/components/theme-toggle";
import { HowToUse } from "@/components/dashboard/how-to-use";

interface TopbarProps {
  userName: string | null;
  virtualCashBalance: number | string;
}

export function Topbar({ userName, virtualCashBalance }: TopbarProps) {
  const balance = Number(virtualCashBalance);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold text-zinc-900 dark:text-white">{userName ?? "Trader"}</span>
      </p>

      <div className="flex items-center gap-2 sm:gap-4">
        <HowToUse />
        <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800/80">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Cash</span>
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <ThemeToggle />

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {userName?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
