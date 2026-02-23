import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRateLimit } from "@/lib/rate-limit";
import { sendSignUpOtpEmail } from "@/lib/send-otp-email";

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip") ?? "unknown";
}

const OTP_EXPIRY_MINUTES = 15;

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
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const pending = await prisma.signUpVerification.findUnique({
      where: { email },
    });
    if (!pending) {
      return NextResponse.json(
        { error: "No pending sign-up for this email. Please sign up again." },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await prisma.signUpVerification.update({
      where: { email },
      data: { otp, expiresAt },
    });

    const sendResult = await sendSignUpOtpEmail(pending.email, otp);
    if (!sendResult.ok) {
      const isDev = process.env.NODE_ENV !== "production";
      const resendLimit = sendResult.error?.includes("only send") ?? false;
      if (isDev && resendLimit) {
        console.info("[DEV] Resend OTP: code not sent (Resend limit). Your code:", otp);
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Could not send verification email. Try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
