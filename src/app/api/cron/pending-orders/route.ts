import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { checkPendingOrders } from "@/lib/jobs/check-pending-orders";

/** Run once: check and execute pending limit/stop-loss orders. Call every minute (Mon–Fri). */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    await checkPendingOrders();
    return NextResponse.json({ ok: true, message: "Pending orders checked" });
  } catch (error) {
    console.error("[cron] Error checking pending orders:", error);
    return NextResponse.json(
      { error: "Failed to check pending orders" },
      { status: 500 }
    );
  }
}
