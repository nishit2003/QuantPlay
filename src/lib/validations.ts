import { z } from "zod";

export const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  type: z.enum(["BUY", "SELL"], { message: "Type must be BUY or SELL" }),
  mode: z.enum(["SHARES", "DOLLARS"]).default("SHARES"),
  quantity: z.number().positive("Quantity must be positive").optional(),
  dollarAmount: z.number().positive("Dollar amount must be positive").optional(),
}).refine(
  (data) => {
    if (data.mode === "SHARES") return data.quantity != null && data.quantity > 0;
    return data.dollarAmount != null && data.dollarAmount > 0;
  },
  { message: "Provide quantity for SHARES mode or dollarAmount for DOLLARS mode" }
);

export const orderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  type: z.enum(["BUY", "SELL"], { message: "Type must be BUY or SELL" }),
  orderType: z.enum(["LIMIT", "STOP_LOSS"], { message: "Order type must be LIMIT or STOP_LOSS" }),
  targetPrice: z.number().positive("Target price must be positive").max(1_000_000, "Target price too high"),
  mode: z.enum(["SHARES", "DOLLARS"]).default("SHARES"),
  quantity: z.number().positive("Quantity must be positive").optional(),
  dollarAmount: z.number().positive("Dollar amount must be positive").optional(),
}).refine(
  (data) => {
    if (data.mode === "SHARES") return data.quantity != null && data.quantity > 0;
    return data.dollarAmount != null && data.dollarAmount > 0;
  },
  { message: "Provide quantity for SHARES mode or dollarAmount for DOLLARS mode" }
);

export const alertSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  targetPrice: z.number().positive("Target price must be positive").max(1_000_000, "Target price too high"),
  direction: z.enum(["above", "below"]).default("above"),
});
