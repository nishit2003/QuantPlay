import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  FINNHUB_API_KEY: z.string().optional(),

  CRON_SECRET: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  FEEDBACK_TO_EMAIL: z.string().email().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function validateEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(`\n❌ Invalid environment variables:\n${formatted}\n`);
    throw new Error("Invalid environment variables — see above.");
  }

  const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error("Either NEXTAUTH_SECRET or AUTH_SECRET must be set.");
  }

  return result.data;
}

export const env = validateEnv();
