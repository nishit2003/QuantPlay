import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { runDividends } from "@/lib/jobs/run-dividends";

/** Run once per month: credit simplified "dividends" (0.1% of holdings) to cash. */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    await runDividends();
    return NextResponse.json({ ok: true, message: "Dividends run" });
  } catch (error) {
    console.error("[cron] Error running dividends:", error);
    return NextResponse.json(
      { error: "Failed to run dividends" },
      { status: 500 }
    );
  }
}
