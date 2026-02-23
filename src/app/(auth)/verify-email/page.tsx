"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const RESEND_COOLDOWN_SEC = 30;

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Start 30s cooldown when landing with email (so they can’t resend immediately)
  useEffect(() => {
    if (emailParam && resendCooldown === 0) setResendCooldown(RESEND_COOLDOWN_SEC);
  }, [emailParam]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();
    if (!trimmedEmail || !trimmedOtp) {
      setError("Enter your email and the 6-digit code from the email.");
      return;
    }
    if (trimmedOtp.length !== 6) {
      setError("Verification code must be 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        setLoading(false);
        return;
      }
      if (data.loginToken) {
        const result = await signIn("credentials", {
          loginToken: data.loginToken,
          redirect: false,
        });
        if (result?.error) {
          setError("Verification succeeded but sign-in failed. Please sign in with your password.");
          setLoading(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
        window.location.href = "/dashboard";
        return;
      }
      window.location.href = `/sign-in?verified=1&email=${encodeURIComponent(trimmedEmail)}`;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Enter your email first.");
      return;
    }
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
      } else {
        setResendCooldown(RESEND_COOLDOWN_SEC);
      }
    } catch {
      setError("Could not resend code. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <Image src="/logo.png" alt="QuantPlay" width={40} height={40} className="h-10 w-10 object-contain" priority />
          <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">QuantPlay</span>
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We sent a 6-digit code to your email. Enter it below.
        </p>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
          Can’t find it? Check your <strong>spam or junk</strong> folder.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="verify-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="verify-otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Verification code
          </label>
          <input
            id="verify-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition text-center text-xl tracking-[0.3em]"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </button>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Didn’t get the code?{" "}
          {resendCooldown > 0 ? (
            <span className="text-zinc-400 dark:text-zinc-500">Resend in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Wrong email?{" "}
        <Link href="/sign-up" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Sign up again
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800 h-64" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
