import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { calculateLeaderboard } from "@/lib/jobs/contest";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const [rankings, pastContests] = await Promise.all([
    calculateLeaderboard(),
    prisma.contestHistory.findMany({
      orderBy: { weekEndDate: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    rankings,
    pastContests,
    currentUserId: session.user.id,
  });
}
