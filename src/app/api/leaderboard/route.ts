import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLeaderboard } from "@/lib/jobs/contest";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
