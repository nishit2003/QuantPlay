import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/** Session with guaranteed user.id (after requireAuth). */
export type AuthenticatedSession = Session & { user: { id: string } & Session["user"] };

/**
 * Returns the current session or a 401 Response. Use in API routes that require auth.
 * Usage: const authResult = await requireAuth(); if (!authResult.ok) return authResult.response;
 *        const { session } = authResult;
 */
export async function requireAuth(): Promise<
  { ok: true; session: AuthenticatedSession } | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, response: UNAUTHORIZED };
  }
  return { ok: true, session: session as AuthenticatedSession };
}
