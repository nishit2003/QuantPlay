import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// On Vercel/serverless, use 1 connection per instance to avoid pool exhaustion and timeouts
const raw = process.env.DATABASE_URL!;
const connectionString =
  process.env.VERCEL || process.env.NODE_ENV === "production"
    ? raw.includes("?")
      ? `${raw}&connection_limit=1&connect_timeout=30`
      : `${raw}?connection_limit=1&connect_timeout=30`
    : raw;

const adapter = new PrismaMariaDb(connectionString);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
