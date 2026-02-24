"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Trade",
    href: "/trade",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/orders",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    label: "Watchlist",
    href: "/watchlist",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
  {
    label: "Auto-Invest",
    href: "/auto-invest",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  {
    label: "Recharge",
    href: "/recharge",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.77.896m0 0a6.023 6.023 0 0 1-2.77-.896" />
      </svg>
    ),
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75v-.7V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
];

export function Sidebar({ referralCode }: { referralCode?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Fetch streak
  useEffect(() => {
    fetch("/api/streak").then(r => r.json()).then(d => setCurrentStreak(d.currentStreak ?? 0)).catch(() => {});
  }, []);

  function handleTradeClick(e: React.MouseEvent) {
    if (pathname.startsWith("/trade")) {
      e.preventDefault();
      router.push("/trade");
    }
  }
  const inviteUrl = referralCode
    ? typeof window !== "undefined"
      ? `${window.location.origin}/sign-up?ref=${encodeURIComponent(referralCode)}`
      : ""
    : "";

  function copyInviteLink() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Mobile menu button — centered vertically in the 48px topbar. Hidden when sidebar is open */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="fixed left-2 top-1 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-transparent lg:hidden touch-manipulation"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-transform duration-300 ease-out lg:w-60 lg:bg-zinc-50 lg:dark:bg-zinc-900 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo + close button on mobile */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
          <Image src="/logo_bull.png" alt="QuantPlay" width={32} height={32} className="h-8 w-8 object-contain" priority />
          <span className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            QuantPlay
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition lg:hidden"
          aria-label="Close menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Navigation — min 44px touch targets on mobile */}
      <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isTrade = item.href === "/trade";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isTrade ? handleTradeClick : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] text-[13px] font-medium transition touch-manipulation lg:py-2 lg:min-h-0 ${
                isActive
                  ? "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Streak badge */}
      {currentStreak > 0 && (
        <div className="mx-3 mb-2 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200/50 dark:border-orange-800/30 px-3 py-2.5">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{currentStreak}-day streak</p>
            <p className="text-[10px] text-orange-500/70 dark:text-orange-500/50">Keep trading daily!</p>
          </div>
        </div>
      )}

      {/* Invite + Profile + Feedback + Sign out — touch-friendly on mobile */}
      <div className="border-t border-zinc-200 p-3 pb-20 lg:pb-3 dark:border-zinc-800 space-y-0.5 shrink-0">
        {referralCode && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Invite friends — get $50 when they join</p>
            <button
              type="button"
              onClick={copyInviteLink}
              className="w-full rounded-xl bg-emerald-600/10 px-3 py-3 min-h-[44px] text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/20 transition touch-manipulation"
            >
              {copied ? "Copied!" : "Copy invite link"}
            </button>
          </div>
        )}
        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] text-[13px] font-medium transition touch-manipulation lg:py-2 lg:min-h-0 ${
            pathname === "/profile"
              ? "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
        >
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998-0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          Profile
        </Link>
        <Link
          href="/feedback"
          className={`flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] text-[13px] font-medium transition touch-manipulation lg:py-2 lg:min-h-0 ${
            pathname === "/feedback"
              ? "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
        >
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 0A2.25 2.25 0 0 0 5.25 10.5v9a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 19.5v-9a2.25 2.25 0 0 0-2.25-2.25h-9m-9 0V6.75a2.25 2.25 0 0 1 2.25-2.25h9m-9 0a2.25 2.25 0 0 1 2.25 2.25m-9 0V6.75a2.25 2.25 0 0 0 2.25 2.25h9m-9 0V10.5" />
          </svg>
          Feedback
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] text-[13px] font-medium text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white transition touch-manipulation lg:py-2 lg:min-h-0 text-left"
        >
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
