"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
      </svg>
    ),
  },
  {
    href: "/trade",
    label: "Trade",
    icon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Activity",
    icon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/watchlist",
    label: "Lists",
    icon: (
      <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleTradeClick(e: React.MouseEvent) {
    if (pathname.startsWith("/trade")) {
      e.preventDefault();
      router.push("/trade");
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
      {/* Gradient fade above the bar */}
      <div className="h-6 bg-gradient-to-t from-white/80 dark:from-zinc-950/80 to-transparent pointer-events-none" />

      {/* Glass bar */}
      <div className="border-t border-zinc-200/40 dark:border-zinc-700/40 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const isActive = tab.href === "/trade"
              ? pathname.startsWith("/trade")
              : (pathname === tab.href || pathname.startsWith(tab.href + "/"));
            const isTrade = tab.href === "/trade";

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={isTrade ? handleTradeClick : undefined}
                className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 touch-manipulation ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400 dark:text-zinc-500 active:text-zinc-600 dark:active:text-zinc-300"
                }`}
              >
                {/* Active background pill */}
                {isActive && (
                  <span className="absolute inset-x-2 -top-0.5 h-[3px] rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}

                <span className="relative">
                  {isActive ? tab.iconFilled : tab.icon}
                </span>

                <span className={`text-[10px] leading-tight tracking-tight ${
                  isActive ? "font-bold" : "font-medium"
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
