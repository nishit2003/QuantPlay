/**
 * Simple in-memory rate limit: max N requests per windowMs per key.
 * Use for API routes (e.g. by IP or userId). Resets on server restart.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const defaultWindowMs = 60_000; // 1 min
const defaultMax = 100;

export function rateLimit(options?: { windowMs?: number; max?: number }) {
  const windowMs = options?.windowMs ?? defaultWindowMs;
  const max = options?.max ?? defaultMax;

  return function check(key: string): { ok: true } | { ok: false; retryAfter: number } {
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      store.set(key, entry);
      return { ok: true };
    }
    entry.count++;
    if (entry.count > max) {
      return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { ok: true };
  };
}

export const apiRateLimit = rateLimit({ windowMs: 60_000, max: 120 });
export const authRateLimit = rateLimit({ windowMs: 60_000, max: 10 });
