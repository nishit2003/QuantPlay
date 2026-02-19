import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// On Vercel (cloud): use default Prisma Client — works better with Aiven/MySQL (SSL, connection pool).
// Local: use MariaDB adapter for your local MariaDB/MySQL.
const useAdapter = !process.env.VERCEL;

function createPrisma() {
  if (useAdapter) {
    const connectionString = process.env.DATABASE_URL!;
    const adapter = new PrismaMariaDb(connectionString);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
