import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    process.env.NEXTAUTH_SECRET = "test-secret";

    await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
  });

  it("throws when neither NEXTAUTH_SECRET nor AUTH_SECRET is set", async () => {
    process.env.DATABASE_URL = "mysql://user:pass@localhost/db";
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.AUTH_SECRET;

    await expect(import("@/lib/env")).rejects.toThrow(
      "Either NEXTAUTH_SECRET or AUTH_SECRET must be set"
    );
  });

  it("succeeds with valid minimal env", async () => {
    process.env.DATABASE_URL = "mysql://user:pass@localhost/db";
    process.env.NEXTAUTH_SECRET = "test-secret-at-least-one";

    const mod = await import("@/lib/env");
    expect(mod.env.DATABASE_URL).toBe("mysql://user:pass@localhost/db");
  });
});
