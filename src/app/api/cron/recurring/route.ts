import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { executeRecurringOrders } from "@/lib/jobs/execute-recurring-orders";

/** Run once: execute due recurring/auto-invest orders. Call every hour. */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  void executeRecurringOrders().catch((err) => {
    console.error("[cron] Error executing recurring orders:", err);
  });
  return NextResponse.json({ ok: true, message: "Recurring orders job started" });
}
