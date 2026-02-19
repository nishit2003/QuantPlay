import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { finalizeWeeklyContest } from "@/lib/jobs/contest";

/** Run once: finalize weekly contest and record winner. Call Friday 4:00 PM ET. */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    await finalizeWeeklyContest();
    return NextResponse.json({ ok: true, message: "Weekly contest finalized" });
  } catch (error) {
    console.error("[cron] Error finalizing contest:", error);
    return NextResponse.json(
      { error: "Failed to finalize contest" },
      { status: 500 }
    );
  }
}
