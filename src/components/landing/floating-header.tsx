"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { label: "Platform", href: "#platform" },
  { label: "Academy", href: "#academy" },
  { label: "Compete", href: "#compete" },
];

export function FloatingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-1/2 top-4 z-50 flex w-[94%] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full border px-5 py-2.5 transition-all duration-500 sm:top-6 sm:px-6 sm:py-3 ${
        scrolled
          ? "border-zinc-200/80 bg-white/80 shadow-lg shadow-zinc-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/40"
          : "border-transparent bg-white/40 backdrop-blur-md dark:bg-zinc-900/30"
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo_bull.png"
          alt="QuantPlay"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 object-contain"
          priority
        />
        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
          QuantPlay
        </span>
      </Link>

      <nav className="hidden items-center gap-7 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 md:flex">
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            {n.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <Link
          href="/sign-in"
          className="hidden text-[13px] font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white sm:inline"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.03] dark:bg-white dark:text-black sm:px-5 sm:text-sm"
        >
          Start free
        </Link>
      </div>
    </header>
  );
}
