import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/sign-in", "/sign-up"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isApiRoute = pathname.startsWith("/api/");

  // Always allow API routes through
  if (isApiAuthRoute || isApiRoute) {
    return NextResponse.next();
  }

  // Don't redirect logged-in users away from sign-in here — the sign-in page does it client-side.
  // (Otherwise we get a loop: dashboard layout doesn't see cookie → redirect sign-in → middleware sees cookie → redirect dashboard → repeat.)

  // Allow public routes (including sign-in/sign-up)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Dashboard and app routes: let the layout handle auth (getCurrentUser → redirect).
  // Avoids redirect loop when middleware doesn't see the session cookie (e.g. Edge / timing).
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/alerts") || pathname.startsWith("/orders") || pathname.startsWith("/trade") || pathname.startsWith("/watchlist") || pathname.startsWith("/leaderboard") || pathname.startsWith("/auto-invest") || pathname.startsWith("/recharge") || pathname.startsWith("/feedback")) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in for other protected routes
  if (!isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
