import { describe, it, expect, vi, beforeEach } from "vitest";
import { TtlCache } from "@/lib/market/cache";

describe("TtlCache", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves a value", () => {
    const cache = new TtlCache<string>(5000);
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for missing key", () => {
    const cache = new TtlCache<string>(5000);
    expect(cache.get("missing")).toBeUndefined();
  });

  it("expires values after TTL", () => {
    vi.useFakeTimers();
    const cache = new TtlCache<string>(100);
    cache.set("key1", "value1");

    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(150);

    expect(cache.get("key1")).toBeUndefined();
  });

  it("does not expire values before TTL", () => {
    vi.useFakeTimers();
    const cache = new TtlCache<string>(1000);
    cache.set("key1", "value1");

    vi.advanceTimersByTime(500);

    expect(cache.get("key1")).toBe("value1");
  });

  it("overwrites existing values", () => {
    const cache = new TtlCache<string>(5000);
    cache.set("key1", "value1");
    cache.set("key1", "value2");
    expect(cache.get("key1")).toBe("value2");
  });

  it("clears all values", () => {
    const cache = new TtlCache<string>(5000);
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.get("key1")).toBeUndefined();
    expect(cache.get("key2")).toBeUndefined();
  });

  it("handles different value types", () => {
    const cache = new TtlCache<{ price: number }>(5000);
    cache.set("AAPL", { price: 150.25 });
    expect(cache.get("AAPL")).toEqual({ price: 150.25 });
  });
});
