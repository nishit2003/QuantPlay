import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { withAccelerate } from "@prisma/extension-accelerate";

const raw = process.env.DATABASE_URL!;
const useAccelerate = raw?.startsWith("prisma://");

function parseDatabaseUrl(url: string) {
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
  return {
    host: host?.trim() || "localhost",
    port: portStr ? parseInt(portStr, 10) : 3306,
    user,
    password,
    database,
  };
}

function createPrisma() {
  if (useAccelerate) {
    return new PrismaClient({ accelerateUrl: raw }).$extends(withAccelerate());
  }

  // PrismaMariaDb creates its own internal pool from the config we give it.
  // TiDB Cloud Serverless requires SNI (servername) in the TLS handshake,
  // so we must pass a config object with explicit SSL settings — NOT a URL string,
  // because the mariadb driver doesn't support SNI via URL query params.
  const config = parseDatabaseUrl(raw);
  const adapter = new PrismaMariaDb({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: { rejectUnauthorized: true, servername: config.host } as unknown as boolean,
    connectionLimit: 5,
    connectTimeout: 45_000,
    acquireTimeout: 45_000,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
};

/** Typed as base PrismaClient so model return types (findMany, etc.) are preserved. */
export const prisma = (globalForPrisma.prisma ?? createPrisma()) as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as ReturnType<typeof createPrisma>;
}
