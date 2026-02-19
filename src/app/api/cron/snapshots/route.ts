import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";
import { runPortfolioSnapshots } from "@/lib/jobs/portfolio-snapshot";

/** Run once: snapshot all users' portfolio value for the day. Call daily. */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    await runPortfolioSnapshots();
    return NextResponse.json({ ok: true, message: "Snapshots saved" });
  } catch (error) {
    console.error("[cron] Error running portfolio snapshots:", error);
    return NextResponse.json(
      { error: "Failed to run snapshots" },
      { status: 500 }
    );
  }
}
