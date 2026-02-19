import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/require-cron-secret";

/**
 * Legacy cron entrypoint. Cron is now split into run-once endpoints.
 * Use these with CRON_SECRET (Bearer token or ?secret=):
 * - GET /api/cron/pending-orders  — every minute (Mon–Fri)
 * - GET /api/cron/recurring      — every hour
 * - GET /api/cron/contest        — Friday 4:00 PM ET
 */
export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    message: "Use the cron endpoints below with CRON_SECRET",
    endpoints: [
      { path: "/api/cron/pending-orders", schedule: "Every minute Mon-Fri" },
      { path: "/api/cron/recurring", schedule: "Every hour" },
      { path: "/api/cron/contest", schedule: "Friday 4:00 PM ET" },
      { path: "/api/cron/alerts", schedule: "Every 5 min" },
      { path: "/api/cron/snapshots", schedule: "Daily" },
      { path: "/api/cron/dividends", schedule: "Monthly" },
    ],
  });
}
