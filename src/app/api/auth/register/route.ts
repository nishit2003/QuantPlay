import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip") ?? "unknown";
}

const STARTING_BALANCE = 1000;
const REFERRAL_BONUS = 50;

function generateReferralCode(name: string): string {
  const base = (name || "user").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 12) || "user";
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}_${rnd}`;
}

export async function POST(request: Request) {
  const rl = authRateLimit(getClientKey(request));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }
  try {
    const body = await request.json();
    const { name, email, password, ref: referralCode } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    let referredById: string | null = null;
    if (referralCode && typeof referralCode === "string") {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.trim() },
        select: { id: true },
      });
      if (referrer) referredById = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let code = generateReferralCode(name);
    let exists = await prisma.user.findUnique({ where: { referralCode: code } });
    while (exists) {
      code = generateReferralCode(name + Math.random());
      exists = await prisma.user.findUnique({ where: { referralCode: code } });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        virtualCashBalance: STARTING_BALANCE,
        startingVirtualCashBalance: STARTING_BALANCE,
        referralCode: code,
        referredById,
      },
    });

    if (referredById) {
      await prisma.user.update({
        where: { id: referredById },
        data: { virtualCashBalance: { increment: REFERRAL_BONUS } },
      });
    }

    return NextResponse.json(
      { message: "Account created successfully.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
