import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

/** GET /api/portfolio/snapshots — last 90 days of portfolio value for the chart. */
export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  try {
    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 90,
    });
    const sorted = [...snapshots].reverse();

    return NextResponse.json({
      snapshots: sorted.map((s) => ({
        date: s.date.toISOString().slice(0, 10),
        value: Number(s.value),
      })),
    });
  } catch (error) {
    console.error("[portfolio/snapshots]", error);
    return NextResponse.json({ error: "Failed to load snapshots" }, { status: 500 });
  }
}
