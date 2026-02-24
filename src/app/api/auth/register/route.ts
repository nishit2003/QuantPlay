import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { sendSignUpOtpEmail } from "@/lib/send-otp-email";
import { validatePassword } from "@/lib/password-rules";
import { isProfane } from "@/lib/profanity";

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip") ?? "unknown";
}

const STARTING_BALANCE = 1000;
const REFERRAL_BONUS = 50;
const OTP_EXPIRY_MINUTES = 15;

function generateReferralCode(name: string): string {
  const base = (name || "user").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 12) || "user";
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}_${rnd}`;
}

function generateOtp(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
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
    const { name, email, password, ref: referralCode, referralSource } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (isProfane(name)) {
      return NextResponse.json(
        { error: "Please choose a more appropriate name." },
        { status: 400 }
      );
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      return NextResponse.json(
        { error: pwCheck.message },
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

    let referrer: { id: string; emailVerified: Date | null } | null = null;
    if (referralCode && typeof referralCode === "string") {
      referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.trim() },
        select: { id: true, emailVerified: true },
      });
    }
    const referredById = referrer?.id ?? null;

    const hashedPassword = await bcrypt.hash(password, 12);
    let code = generateReferralCode(name);
    let exists = await prisma.user.findUnique({ where: { referralCode: code } });
    while (exists) {
      code = generateReferralCode(name + Math.random());
      exists = await prisma.user.findUnique({ where: { referralCode: code } });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const emailLower = email.trim().toLowerCase();

    await prisma.signUpVerification.upsert({
      where: { email: emailLower },
      create: {
        email: emailLower,
        name,
        hashedPassword,
        referredById,
        referralCode: code,
        otp,
        referralSource: typeof referralSource === "string" ? referralSource.slice(0, 50) : null,
        expiresAt,
      },
      update: {
        name,
        hashedPassword,
        referredById,
        referralCode: code,
        otp,
        referralSource: typeof referralSource === "string" ? referralSource.slice(0, 50) : null,
        expiresAt,
      },
    });

    const sendResult = await sendSignUpOtpEmail(email.trim(), otp);
    if (!sendResult.ok) {
      const isDev = process.env.NODE_ENV !== "production";
      const resendLimit = sendResult.error?.includes("only send") ?? false;
      // In dev, when Resend free tier blocks (only your own email): still proceed; OTP is in the terminal.
      if (isDev && resendLimit) {
        console.info("[DEV] OTP email not sent (Resend free-tier limit). Your code:", otp);
        return NextResponse.json(
          { needVerify: true, email: emailLower },
          { status: 200 }
        );
      }
      console.error("OTP email failed:", sendResult.error);
      return NextResponse.json(
        {
          error: isDev && sendResult.error
            ? `Verification email failed: ${sendResult.error}`
            : "Could not send verification email. Please try again or contact support.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { needVerify: true, email: emailLower },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error & { code?: string };
    const message = err?.message ?? String(error);
    console.error("Registration error:", err?.code ?? err?.name ?? "Error", message);
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { error: isDev ? message : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
