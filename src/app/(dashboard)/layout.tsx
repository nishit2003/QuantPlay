import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { SessionProvider } from "@/components/providers/session-provider";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { QuickTradeFAB } from "@/components/dashboard/quick-trade-fab";
import { PageTransition } from "@/components/ui/page-transition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SessionProvider>
      <div className="flex min-h-screen overflow-x-hidden bg-zinc-100 dark:bg-zinc-950">
        <Sidebar referralCode={user.referralCode ?? undefined} />
        <div className="flex flex-1 flex-col min-w-0 pl-0 lg:pl-60 h-screen overflow-hidden">
          <Topbar
            userName={user.name}
            virtualCashBalance={Number(user.virtualCashBalance)}
          />
          <main id="main-scroll" className="flex-1 overflow-y-auto overscroll-contain scroll-smooth p-3 pb-24 sm:p-5 lg:pb-8 min-w-0">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <MobileBottomNav />
        <QuickTradeFAB />
      </div>
    </SessionProvider>
  );
}
