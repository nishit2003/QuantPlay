import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { checkPriceAlerts } from "@/lib/jobs/check-price-alerts";

/** Run once: check price alerts and mark triggered. Call every few minutes. */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    await checkPriceAlerts();
    return NextResponse.json({ ok: true, message: "Price alerts checked" });
  } catch (error) {
    console.error("[cron] Error checking price alerts:", error);
    return NextResponse.json(
      { error: "Failed to check price alerts" },
      { status: 500 }
    );
  }
}
