import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/send-welcome-email";

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip") ?? "unknown";
}

const STARTING_BALANCE = 1000;
const REFERRAL_BONUS = 50;

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
    const { email, otp } = body;

    if (!email || !otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    const emailLower = email.trim().toLowerCase();
    const pending = await prisma.signUpVerification.findUnique({
      where: { email: emailLower },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please sign up again." },
        { status: 400 }
      );
    }

    if (pending.otp !== otp.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      );
    }

    if (new Date() > pending.expiresAt) {
      await prisma.signUpVerification.delete({ where: { id: pending.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Verification code has expired. Please sign up again to get a new code." },
        { status: 400 }
      );
    }

    const referrer = pending.referredById
      ? await prisma.user.findUnique({
          where: { id: pending.referredById },
          select: { id: true, emailVerified: true },
        })
      : null;

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        hashedPassword: pending.hashedPassword,
        emailVerified: new Date(),
        virtualCashBalance: STARTING_BALANCE,
        startingVirtualCashBalance: STARTING_BALANCE,
        referralCode: pending.referralCode,
        referredById: pending.referredById,
      },
    });

    await prisma.signUpVerification.delete({ where: { id: pending.id } }).catch(() => {});

    if (referrer?.emailVerified) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: { virtualCashBalance: { increment: REFERRAL_BONUS } },
      });
    }

    // One-time login token so we can sign the user in without asking for password
    const loginToken = crypto.randomBytes(32).toString("hex");
    const loginExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await prisma.verificationToken.create({
      data: {
        identifier: user.id,
        token: loginToken,
        expires: loginExpires,
      },
    });

    // Send thank-you / welcome email (don't block or fail sign-up if it errors)
    if (user.email && user.name) {
      sendWelcomeEmail(user.email, user.name).then((result) => {
        if (!result.ok) console.error("[Welcome email]", result.error);
      });
    }

    return NextResponse.json(
      { success: true, email: user.email, loginToken },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error("Verify sign-up error:", err?.code ?? err?.name ?? "Error", err?.message ?? error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
