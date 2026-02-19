import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { executeRecurringOrders } from "@/lib/jobs/execute-recurring-orders";

/** Run once: execute due recurring/auto-invest orders. Call every hour. */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    await executeRecurringOrders();
    return NextResponse.json({ ok: true, message: "Recurring orders executed" });
  } catch (error) {
    console.error("[cron] Error executing recurring orders:", error);
    return NextResponse.json(
      { error: "Failed to execute recurring orders" },
      { status: 500 }
    );
  }
}
