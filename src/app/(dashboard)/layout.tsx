import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { SessionProvider } from "@/components/providers/session-provider";
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
      <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <Sidebar referralCode={user.referralCode ?? undefined} />
        <div className="flex flex-1 flex-col pl-14 lg:pl-60">
          <Topbar
            userName={user.name}
            virtualCashBalance={Number(user.virtualCashBalance)}
          />
          <main className="flex-1 p-5">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
