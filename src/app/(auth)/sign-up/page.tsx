"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PASSWORD_RULES, validatePassword } from "@/lib/password-rules";

function SignUpForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refCode = searchParams.get("ref") ?? undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      setError(pwCheck.message);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, ref: refCode, referralSource: referralSource || undefined }),
      });

      let data: { error?: string; needVerify?: boolean; email?: string };
      try {
        data = await res.json();
      } catch {
        setError("Invalid response from server. Try again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // API always requires email verification before account exists; never auto sign-in after register.
      if (data.email) {
        window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}`;
        return;
      }

      // Fallback only if API returned success without email (shouldn't happen).
      setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Start with <span className="font-semibold text-emerald-600">$1,000 virtual cash</span> — no credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition sm:py-2.5 sm:text-sm"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition sm:py-2.5 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pr-12 text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition sm:py-2.5 sm:pr-11 sm:text-sm"
              placeholder="Strong password (see requirements)"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 touch-manipulation"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3 3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
          <ul className="mt-1.5 space-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {PASSWORD_RULES.map((rule) => (
              <li key={rule.id} className={`flex items-center gap-1.5 ${rule.test(password) ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {rule.test(password) ? (
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-zinc-300 dark:border-zinc-600" />
                )}
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition sm:py-2.5 sm:text-sm"
            placeholder="Re-enter your password"
          />
        </div>

        <div>
          <label htmlFor="referralSource" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            How did you hear about us?
          </label>
          <select
            id="referralSource"
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition appearance-none sm:py-2.5 sm:text-sm"
          >
            <option value="">Select an option (optional)</option>
            <option value="friend">Friend / Referral</option>
            <option value="social_media">Social Media</option>
            <option value="google">Google Search</option>
            <option value="youtube">YouTube</option>
            <option value="reddit">Reddit</option>
            <option value="twitter">X / Twitter</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="news_article">News / Blog Article</option>
            <option value="app_store">App Store</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 min-h-[48px] text-base font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition touch-manipulation sm:py-2.5 sm:text-sm"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="inline-block font-semibold text-emerald-600 hover:text-emerald-700 py-2 -my-2 touch-manipulation"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800 h-96" />}>
      <SignUpForm />
    </Suspense>
  );
}
