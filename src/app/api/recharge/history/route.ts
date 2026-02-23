import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  try {
    const purchases = await prisma.orderPurchase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("[recharge/history]", error);
    return NextResponse.json({ error: "Failed to load purchase history" }, { status: 500 });
  }
}
