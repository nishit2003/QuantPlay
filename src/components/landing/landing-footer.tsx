import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/lib/constants/landing-data";

const COLUMNS: { heading: string; links: readonly { label: string; href: string }[] }[] = [
  { heading: "Product", links: FOOTER_LINKS.product },
  { heading: "Learn", links: FOOTER_LINKS.learn },
  { heading: "Account", links: FOOTER_LINKS.account },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-zinc-200/70 bg-white/60 px-6 py-16 backdrop-blur-md dark:border-white/5 dark:bg-[#050505]">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo_bull.png"
              alt="QuantPlay"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              QuantPlay
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            A paper-trading platform for everyone — from your first trade to your hundredth strategy.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              {col.heading}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-zinc-200/70 pt-6 text-xs text-zinc-500 dark:border-white/5 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} QuantPlay. All trades are simulated.</p>
        <p>Not investment advice. Market data may be delayed.</p>
      </div>
    </footer>
  );
}
