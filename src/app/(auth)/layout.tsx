import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-zinc-900 via-emerald-950 to-zinc-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative max-w-md text-white">
          <div className="flex items-center gap-2.5 mb-8">
            <Image src="/logo.png" alt="QuantPlay" width={48} height={48} className="h-12 w-12 object-contain" priority />
            <span className="text-2xl font-bold tracking-tight">QuantPlay</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 leading-tight">
            Master the markets,{" "}
            <span className="text-emerald-400">risk-free.</span>
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            A professional paper trading simulator. Start with $1,000 virtual cash,
            analyze real-time charts, execute trades, and compete on the weekly leaderboard.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-emerald-400">$1,000</p>
              <p className="text-xs text-zinc-500 mt-1">Free starting balance</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">Live</p>
              <p className="text-xs text-zinc-500 mt-1">Market prices</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">Weekly</p>
              <p className="text-xs text-zinc-500 mt-1">Competitions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white dark:bg-zinc-950">
        {children}
      </div>
    </div>
  );
}
