import mariadb from "mariadb";

const host = "gateway01.us-east-1.prod.aws.tidbcloud.com";
const port = 4000;
const user = "2hi4HfstP3S4bKx.root";
const password = "pnRPJp0jsiXxLrjx";
const database = "test";

// Test 1: Pool with ssl object (what prisma.ts currently does)
console.log("--- Test 1: createPool with ssl object ---");
try {
  const pool = mariadb.createPool({
    host, port, user, password, database,
    ssl: { rejectUnauthorized: true, servername: host },
    connectionLimit: 5,
    connectTimeout: 15000,
    acquireTimeout: 15000,
  });
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT 1 AS ok");
  console.log("SUCCESS!", rows);
  conn.release();
  await pool.end();
} catch (e) {
  console.log("FAILED:", e.message);
}

// Test 2: Pool with connection string + SSL params
console.log("\n--- Test 2: createPool with URL string ---");
try {
  const url = `mysql://${user}:${password}@${host}:${port}/${database}?ssl=true&servername=${host}`;
  const pool = mariadb.createPool(url);
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT 1 AS ok");
  console.log("SUCCESS!", rows);
  conn.release();
  await pool.end();
} catch (e) {
  console.log("FAILED:", e.message);
}

// Test 3: Pool with connection string + sslMode
console.log("\n--- Test 3: createPool with URL + sslMode ---");
try {
  const url = `mysql://${user}:${password}@${host}:${port}/${database}`;
  const pool = mariadb.createPool({
    host, port, user, password, database,
    ssl: { rejectUnauthorized: false },
    connectionLimit: 2,
    connectTimeout: 15000,
    acquireTimeout: 15000,
  });
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT 1 AS ok");
  console.log("SUCCESS!", rows);
  conn.release();
  await pool.end();
} catch (e) {
  console.log("FAILED:", e.message);
}

// Test 4: PrismaMariaDb with pool  
console.log("\n--- Test 4: PrismaMariaDb with pool ---");
try {
  const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");
  const pool = mariadb.createPool({
    host, port, user, password, database,
    ssl: { rejectUnauthorized: true, servername: host },
    connectionLimit: 2,
    connectTimeout: 15000,
    acquireTimeout: 15000,
  });
  const adapter = new PrismaMariaDb(pool);
  console.log("Adapter created successfully, type:", typeof adapter);
  await pool.end();
  console.log("SUCCESS - adapter created");
} catch (e) {
  console.log("FAILED:", e.message);
  console.log(e.stack);
}

// Test 5: PrismaMariaDb with connection string  
console.log("\n--- Test 5: PrismaMariaDb with connection URL ---");
try {
  const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");
  const url = `mysql://${user}:${password}@${host}:${port}/${database}?ssl=true`;
  const adapter = new PrismaMariaDb(url);
  console.log("Adapter from URL created successfully, type:", typeof adapter);
  console.log("SUCCESS");
} catch (e) {
  console.log("FAILED:", e.message);
}

process.exit(0);
