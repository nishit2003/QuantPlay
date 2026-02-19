#!/usr/bin/env node
/**
 * Check DB connection using DATABASE_URL from .env.
 * Run: node scripts/check-db.mjs
 * Or: npm run db:check
 */
import "dotenv/config";
import mariadb from "mariadb";

function parseDatabaseUrl(url) {
  if (!url || !url.startsWith("mysql://")) {
    throw new Error("DATABASE_URL must be set and start with mysql://");
  }
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

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set in .env");
    process.exit(1);
  }

  let config;
  try {
    config = parseDatabaseUrl(url);
  } catch (e) {
    console.error("❌ Invalid DATABASE_URL:", e.message);
    process.exit(1);
  }

  // Railway MySQL: no SSL. Local MySQL 8 often needs allowPublicKeyRetrieval.
  const connOpts = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectTimeout: 10_000,
    allowPublicKeyRetrieval: true,
    ...(config.ssl ? { ssl: true } : {}),
  };

  let conn;
  try {
    conn = await mariadb.createConnection(connOpts);
    await conn.query("SELECT 1");
    console.log("✅ DB connected successfully");
    console.log("   Host:", config.host + ":" + config.port);
    console.log("   Database:", config.database);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    if (err.code) console.error("   Code:", err.code);
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

main();
