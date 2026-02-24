"use client";

import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleRefresh() {
    router.refresh();
    // Small delay to let the server data refresh
    await new Promise((r) => setTimeout(r, 800));
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children}
    </PullToRefresh>
  );
}
