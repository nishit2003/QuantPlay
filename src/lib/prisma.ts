import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const raw = process.env.DATABASE_URL!;
// Production: limit connections and allow longer connect timeout for cloud DB (e.g. Aiven)
const connectionString =
  process.env.VERCEL || process.env.NODE_ENV === "production"
    ? raw.includes("?")
      ? `${raw}&connection_limit=1&connect_timeout=60`
      : `${raw}?connection_limit=1&connect_timeout=60`
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
