import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { SessionProvider } from "@/components/providers/session-provider";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

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
        <div className="flex flex-1 flex-col min-w-0 pl-0 lg:pl-60">
          <Topbar
            userName={user.name}
            virtualCashBalance={Number(user.virtualCashBalance)}
          />
          <main className="flex-1 p-4 pb-24 sm:p-5 lg:pb-8 min-w-0 overflow-x-hidden">{children}</main>
        </div>
        <MobileBottomNav />
      </div>
    </SessionProvider>
  );
}
