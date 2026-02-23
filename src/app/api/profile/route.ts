import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function PATCH(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  try {
    const body = await request.json();
    const { name, email } = body;

    const data: { name?: string; email?: string; emailVerified?: null } = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof email === "string" && email.trim()) {
      const trimmed = email.trim();
      if (trimmed !== session.user.email) {
        const existing = await prisma.user.findUnique({ where: { email: trimmed } });
        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
          );
        }
        data.email = trimmed;
        data.emailVerified = null; // require re-verification after email change
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Provide name and/or email to update." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
