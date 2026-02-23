import { describe, it, expect } from "vitest";
import { tradeSchema, orderSchema, alertSchema } from "@/lib/validations";

describe("tradeSchema", () => {
  it("accepts a valid BUY SHARES trade", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      mode: "SHARES",
      quantity: 10,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid SELL DOLLARS trade", () => {
    const result = tradeSchema.safeParse({
      symbol: "MSFT",
      type: "SELL",
      mode: "DOLLARS",
      dollarAmount: 500,
    });
    expect(result.success).toBe(true);
  });

  it("defaults mode to SHARES", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      quantity: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.mode).toBe("SHARES");
  });

  it("rejects missing symbol", () => {
    const result = tradeSchema.safeParse({
      type: "BUY",
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "HOLD",
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      mode: "SHARES",
      quantity: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero dollar amount", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      mode: "DOLLARS",
      dollarAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects SHARES mode without quantity", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      mode: "SHARES",
    });
    expect(result.success).toBe(false);
  });

  it("rejects DOLLARS mode without dollarAmount", () => {
    const result = tradeSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      mode: "DOLLARS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects symbol longer than 10 chars", () => {
    const result = tradeSchema.safeParse({
      symbol: "TOOLONGSYMBOL",
      type: "BUY",
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("orderSchema", () => {
  it("accepts a valid LIMIT BUY order", () => {
    const result = orderSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      orderType: "LIMIT",
      targetPrice: 150,
      quantity: 10,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid STOP_LOSS SELL order with dollars", () => {
    const result = orderSchema.safeParse({
      symbol: "MSFT",
      type: "SELL",
      orderType: "STOP_LOSS",
      targetPrice: 300,
      mode: "DOLLARS",
      dollarAmount: 1000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative target price", () => {
    const result = orderSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      orderType: "LIMIT",
      targetPrice: -50,
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects target price over 1M", () => {
    const result = orderSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      orderType: "LIMIT",
      targetPrice: 2_000_000,
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid orderType", () => {
    const result = orderSchema.safeParse({
      symbol: "AAPL",
      type: "BUY",
      orderType: "MARKET",
      targetPrice: 150,
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe("alertSchema", () => {
  it("accepts a valid alert", () => {
    const result = alertSchema.safeParse({
      symbol: "AAPL",
      targetPrice: 200,
      direction: "above",
    });
    expect(result.success).toBe(true);
  });

  it("defaults direction to above", () => {
    const result = alertSchema.safeParse({
      symbol: "AAPL",
      targetPrice: 200,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.direction).toBe("above");
  });

  it("rejects missing symbol", () => {
    const result = alertSchema.safeParse({
      targetPrice: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = alertSchema.safeParse({
      symbol: "AAPL",
      targetPrice: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid direction", () => {
    const result = alertSchema.safeParse({
      symbol: "AAPL",
      targetPrice: 200,
      direction: "sideways",
    });
    expect(result.success).toBe(false);
  });
});
