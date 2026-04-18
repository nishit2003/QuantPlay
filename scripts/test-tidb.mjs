import mariadb from "mariadb";

const host = "gateway01.us-east-1.prod.aws.tidbcloud.com";
const port = 4000;
const user = "2hi4HfstP3S4bKx.root";
const password = "pnRPJp0jsiXxLrjx";
const database = "test";

console.log("Attempting connection to TiDB Cloud...");
console.log(`  Host: ${host}:${port}`);
console.log(`  User: ${user}`);
console.log(`  Database: ${database}`);
console.log();

// Try with ssl: { rejectUnauthorized: true } which sends SNI
try {
  console.log("--- Attempt: ssl with rejectUnauthorized + servername ---");
  const conn = await mariadb.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: true, servername: host },
    connectTimeout: 15000,
  });
  const rows = await conn.query("SELECT 1 AS ok");
  console.log("SUCCESS!", rows);
  await conn.end();
  process.exit(0);
} catch (e) {
  console.log("FAILED:", e.message);
}

// Try with just ssl: true
try {
  console.log("\n--- Attempt: ssl: true ---");
  const conn = await mariadb.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: true,
    connectTimeout: 15000,
  });
  const rows = await conn.query("SELECT 1 AS ok");
  console.log("SUCCESS!", rows);
  await conn.end();
  process.exit(0);
} catch (e) {
  console.log("FAILED:", e.message);
}

// Try with ssl: {} (minimal)
try {
  console.log("\n--- Attempt: ssl: {} ---");
  const conn = await mariadb.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: {},
    connectTimeout: 15000,
  });
  const rows = await conn.query("SELECT 1 AS ok");
  console.log("SUCCESS!", rows);
  await conn.end();
  process.exit(0);
} catch (e) {
  console.log("FAILED:", e.message);
}

console.log("\nAll attempts failed.");
process.exit(1);
