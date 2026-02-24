import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

/** Helper: today as a date-only Date (UTC midnight) */
function todayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Helper: yesterday as a date-only Date */
function yesterdayUTC(): Date {
  const d = todayUTC();
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

/** GET — return the user's streak data */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;
    const userId = authResult.session.user.id;

    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActiveDate: streak?.lastActiveDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[Streak GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** POST — "check in" for the day; returns updated streak */
export async function POST() {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;
    const userId = authResult.session.user.id;

    const today = todayUTC();
    const yesterday = yesterdayUTC();

    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // First ever check-in
      const created = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });
      return NextResponse.json({
        currentStreak: created.currentStreak,
        longestStreak: created.longestStreak,
        lastActiveDate: created.lastActiveDate?.toISOString() ?? null,
        checkedIn: true,
      });
    }

    // Already checked in today
    if (streak.lastActiveDate && streak.lastActiveDate.getTime() === today.getTime()) {
      return NextResponse.json({
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate.toISOString(),
        checkedIn: false,
      });
    }

    // Yesterday — streak continues!
    let newStreak: number;
    if (streak.lastActiveDate && streak.lastActiveDate.getTime() === yesterday.getTime()) {
      newStreak = streak.currentStreak + 1;
    } else {
      // Streak broken — start fresh
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streak.longestStreak);

    const updated = await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
    });

    return NextResponse.json({
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      lastActiveDate: updated.lastActiveDate?.toISOString() ?? null,
      checkedIn: true,
    });
  } catch (error) {
    console.error("[Streak POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

