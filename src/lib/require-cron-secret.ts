import { NextResponse } from "next/server";

/**
 * Validates CRON_SECRET from Authorization header (Bearer <secret>) or query (?secret=).
 * Returns 401 Response if missing or invalid. Use in cron API routes.
 */
export function requireCronSecret(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Cron is not configured. Set CRON_SECRET." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const querySecret = new URL(request.url).searchParams.get("secret");
  const provided = bearer ?? querySecret;

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
