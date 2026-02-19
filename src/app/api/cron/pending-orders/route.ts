import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { checkPendingOrders } from "@/lib/jobs/check-pending-orders";

/** Run once: check and execute pending limit/stop-loss orders. Call every minute (Mon–Fri). */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  // Respond immediately so cron caller (e.g. cron-job.org) doesn't timeout.
  // Job runs in background; errors are logged server-side.
  void checkPendingOrders().catch((err) => {
    console.error("[cron] Error checking pending orders:", err);
  });
  return NextResponse.json({ ok: true, message: "Pending orders job started" });
}
