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

  // Redirect logged-in users away from auth pages to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
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
