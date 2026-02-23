"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/dashboard";
    }
  }, [status]);

  if (status === "authenticated" || status === "loading") {
    return (
      <div className="w-full max-w-md text-center text-zinc-500 dark:text-zinc-400">
        {status === "loading" ? "Loading…" : "Taking you to dashboard…"}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        // Brief delay so Chrome/Brave commit the session cookie before the next request.
        await new Promise((r) => setTimeout(r, 150));
        window.location.href = "/dashboard";
      }
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
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to your QuantPlay account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {verified && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            Email verified. Sign in with your password.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

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
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition sm:py-2.5 sm:text-sm"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 min-h-[48px] text-base font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition touch-manipulation sm:py-2.5 sm:text-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="inline-block font-semibold text-emerald-600 hover:text-emerald-700 py-2 -my-2 touch-manipulation"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800 h-96" />}>
      <SignInForm />
    </Suspense>
  );
}
