import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(url: string): { host: string; port: number; user: string; password: string; database: string; ssl: boolean } {
  const withoutScheme = url.replace(/^mysql:\/\//, "");
  const lastAt = withoutScheme.lastIndexOf("@");
  const auth = withoutScheme.slice(0, lastAt);
  const hostPart = withoutScheme.slice(lastAt + 1);
  const colonIdx = auth.indexOf(":");
  const user = colonIdx >= 0 ? decodeURIComponent(auth.slice(0, colonIdx)) : "";
  const password = colonIdx >= 0 ? decodeURIComponent(auth.slice(colonIdx + 1)) : "";
  const [hostPort, dbPath] = hostPart.split("/");
  const [host, portStr] = hostPort.split(":");
  const database = (dbPath?.split("?")[0] || "defaultdb").trim() || "defaultdb";
  const ssl =
    url.includes("ssl-mode=REQUIRED") ||
    url.includes("sslmode=require") ||
    url.includes("ssl=true");
  return {
    host: host?.trim() || "localhost",
    port: portStr ? parseInt(portStr, 10) : 3306,
    user,
    password,
    database,
    ssl,
  };
}

const raw = process.env.DATABASE_URL!;
const isProduction = !!process.env.VERCEL || process.env.NODE_ENV === "production";

const adapter = isProduction
  ? (() => {
      const config = parseDatabaseUrl(raw);
      return new PrismaMariaDb({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl || true,
        connectionLimit: 1,
        connectTimeout: 30_000,
        acquireTimeout: 30_000,
      });
    })()
  : new PrismaMariaDb(raw);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
