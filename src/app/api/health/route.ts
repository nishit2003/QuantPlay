import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/health — checks DB (and optionally market). For uptime monitors. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error("Health check DB failed:", e);
    return NextResponse.json(
      { ok: false, error: "Database unavailable" },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}
