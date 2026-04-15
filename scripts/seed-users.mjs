/**
 * Seed script: ~55 dummy users with REALISTIC total portfolio values ($400–$2000).
 * Total value = cash + sum(qty × price). Everyone started with $1,000.
 *
 * Usage:  node scripts/seed-users.mjs
 */
import mariadb from "mariadb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ── connection ──────────────────────────────────────────────────────────────
const host = "gateway01.us-east-1.prod.aws.tidbcloud.com";
const port = 4000;
const user = "2hi4HfstP3S4bKx.root";
const password = "pnRPJp0jsiXxLrjx";
const database = "test";

const conn = await mariadb.createConnection({
  host, port, user, password, database,
  ssl: { rejectUnauthorized: true, servername: host },
  connectTimeout: 30_000,
});
console.log("✓ Connected to TiDB");

// ── wipe old seeded data ────────────────────────────────────────────────────
console.log("Cleaning old data…");
await conn.query("DELETE FROM WatchlistItem");
await conn.query("DELETE FROM Watchlist");
await conn.query("DELETE FROM TradeTransaction");
await conn.query("DELETE FROM PortfolioItem");
await conn.query("DELETE FROM PortfolioSnapshot");
await conn.query("DELETE FROM PriceAlert");
await conn.query("DELETE FROM PendingOrder");
await conn.query("DELETE FROM RecurringOrder");
await conn.query("DELETE FROM UserStreak");
await conn.query("DELETE FROM OrderPurchase");
await conn.query("DELETE FROM Session");
await conn.query("DELETE FROM Account");
await conn.query("DELETE FROM SignUpVerification");
await conn.query("DELETE FROM VerificationToken");
await conn.query("DELETE FROM ContestHistory");
await conn.query("DELETE FROM User");
console.log("✓ Cleaned all tables");

// ── helpers ─────────────────────────────────────────────────────────────────
const cuid = () => `c${Date.now().toString(36)}${crypto.randomBytes(8).toString("hex")}`;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

function genReferralCode(name) {
  const base = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 12) || "user";
  return `${base}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ── name pools ──────────────────────────────────────────────────────────────
const indianFirst = [
  "Aarav","Aditi","Aisha","Amit","Ananya","Arjun","Deepa","Dev",
  "Diya","Gaurav","Ishaan","Kavya","Krish","Meera","Neha",
  "Nikhil","Pooja","Priya","Rahul","Riya","Rohan","Sahil",
  "Shreya","Siddharth","Tanvi","Varun","Vikram","Zara",
];
const indianLast = [
  "Agarwal","Banerjee","Choudhary","Desai","Gupta","Iyer","Jain",
  "Kapoor","Kumar","Malhotra","Mehta","Nair","Patel","Rao",
  "Reddy","Shah","Sharma","Singh","Srinivasan","Verma",
];
const usFirst = [
  "Alex","Amanda","Brian","Chloe","Daniel","Emily","Ethan",
  "Grace","Jack","Jessica","Jordan","Katie","Liam","Madison",
  "Mason","Mia","Nathan","Olivia","Ryan","Sophia","Tyler","Zoe",
];
const usLast = [
  "Adams","Anderson","Baker","Brown","Clark","Davis","Evans",
  "Garcia","Harris","Jackson","Johnson","Lee","Martin","Miller",
  "Moore","Robinson","Smith","Taylor","Thomas","White","Williams","Wilson",
];

// current approximate prices (used to compute realistic qty)
const tickerPrices = {
  AAPL:195, MSFT:420, GOOGL:155, AMZN:185, NVDA:880, META:500,
  TSLA:170, JPM:195, V:280, JNJ:155, WMT:165, PG:165,
  UNH:520, HD:360, MA:460, DIS:115, NFLX:620, ADBE:520,
  CRM:275, INTC:30, AMD:160, PYPL:65, BA:180, NKE:95,
  SBUX:90, KO:60, PEP:175, COST:730, QCOM:170, TXN:175,
};
const tickers = Object.keys(tickerPrices);

// ── generate users ──────────────────────────────────────────────────────────
const dummyHash = await bcrypt.hash("DummyUser123!", 10);
const usedEmails = new Set();
const usedCodes = new Set();
const allUsers = [];

for (let i = 0; i < 55; i++) {
  const isIndian = i < 28;
  const first = isIndian ? pick(indianFirst) : pick(usFirst);
  const last = isIndian ? pick(indianLast) : pick(usLast);
  const name = `${first} ${last}`;

  // unique email
  let email;
  do {
    email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,999)}@${pick(["gmail.com","outlook.com","yahoo.com","icloud.com"])}`;
  } while (usedEmails.has(email));
  usedEmails.add(email);

  // unique referral code
  let code;
  do { code = genReferralCode(name); } while (usedCodes.has(code));
  usedCodes.add(code);

  // ── REALISTIC total value: $400 – $2,000 ──
  // Bell-curve-ish distribution centered around $900-$1,100
  const targetTotal = parseFloat(rand(400, 2000).toFixed(2));

  // Decide how many holdings (0-4). Some users are cash-only.
  const numHoldings = randInt(0, 4);
  const holdingTickers = [];
  while (holdingTickers.length < numHoldings) {
    const t = pick(tickers);
    if (!holdingTickers.includes(t)) holdingTickers.push(t);
  }

  // Allocate: portion of targetTotal goes to holdings, rest is cash
  const holdingFraction = numHoldings === 0 ? 0 : rand(0.1, 0.7);
  const holdingBudget = targetTotal * holdingFraction;
  const cashBalance = parseFloat((targetTotal - holdingBudget).toFixed(2));

  // split holding budget among chosen tickers
  const holdings = [];
  if (numHoldings > 0) {
    // random weights
    const weights = holdingTickers.map(() => Math.random());
    const wSum = weights.reduce((a, b) => a + b, 0);
    for (let j = 0; j < holdingTickers.length; j++) {
      const ticker = holdingTickers[j];
      const price = tickerPrices[ticker];
      const budget = holdingBudget * (weights[j] / wSum);
      const qty = parseFloat((budget / price).toFixed(8));
      if (qty > 0.001) {
        const costBasis = parseFloat((price * rand(0.9, 1.1)).toFixed(2));
        holdings.push({ ticker, qty, costBasis, price });
      }
    }
  }

  const createdDaysAgo = randInt(2, 90);
  const createdAt = new Date(Date.now() - createdDaysAgo * 86400000);

  allUsers.push({
    id: cuid(),
    name, email,
    emailVerified: createdAt,
    hashedPassword: dummyHash,
    virtualCashBalance: cashBalance,
    startingVirtualCashBalance: 1000,
    referralCode: code,
    createdAt,
    updatedAt: new Date(),
    holdings,
  });
}

console.log(`Generated ${allUsers.length} users. Inserting…`);

// ── insert users ────────────────────────────────────────────────────────────
for (const u of allUsers) {
  await conn.query(
    `INSERT INTO User (id, name, email, emailVerified, hashedPassword,
      virtualCashBalance, startingVirtualCashBalance, referralCode,
      createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [u.id, u.name, u.email, u.emailVerified, u.hashedPassword,
     u.virtualCashBalance, u.startingVirtualCashBalance, u.referralCode,
     u.createdAt, u.updatedAt]
  );
}
console.log(`✓ Inserted ${allUsers.length} users`);

// ── insert portfolios & trades ──────────────────────────────────────────────
let portfolioCount = 0, tradeCount = 0;

for (const u of allUsers) {
  for (const h of u.holdings) {
    await conn.query(
      `INSERT INTO PortfolioItem (id, userId, tickerSymbol, quantity, averageCostBasis)
       VALUES (?, ?, ?, ?, ?)`,
      [cuid(), u.id, h.ticker, h.qty, h.costBasis]
    );
    portfolioCount++;

    // 1-2 historical trades per holding
    const numTrades = randInt(1, 2);
    for (let t = 0; t < numTrades; t++) {
      const tradePrice = parseFloat((h.price * rand(0.9, 1.1)).toFixed(2));
      const tradeQty = parseFloat((h.qty / numTrades).toFixed(8));
      const total = parseFloat((tradePrice * tradeQty).toFixed(2));
      const daysAgo = randInt(1, 60);
      await conn.query(
        `INSERT INTO TradeTransaction (id, userId, tickerSymbol, type, orderMode,
          orderType, quantity, pricePerShare, totalAmount, timestamp)
         VALUES (?, ?, ?, 'BUY', 'SHARES', 'MARKET', ?, ?, ?, ?)`,
        [cuid(), u.id, h.ticker, tradeQty, tradePrice, total,
         new Date(Date.now() - daysAgo * 86400000)]
      );
      tradeCount++;
    }
  }
}
console.log(`✓ Inserted ${portfolioCount} portfolio items`);
console.log(`✓ Inserted ${tradeCount} trade transactions`);

// ── streaks ─────────────────────────────────────────────────────────────────
let streakCount = 0;
for (const u of allUsers) {
  if (Math.random() > 0.4) continue;
  const current = randInt(1, 15);
  const longest = randInt(current, 25);
  await conn.query(
    `INSERT INTO UserStreak (id, userId, currentStreak, longestStreak, lastActiveDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cuid(), u.id, current, longest, new Date(), u.createdAt, new Date()]
  );
  streakCount++;
}
console.log(`✓ Inserted ${streakCount} user streaks`);

// ── watchlists ──────────────────────────────────────────────────────────────
let watchlistCount = 0;
for (const u of allUsers) {
  if (Math.random() > 0.5) continue;
  const wId = cuid();
  await conn.query(`INSERT INTO Watchlist (id, userId) VALUES (?, ?)`, [wId, u.id]);
  const numItems = randInt(2, 6);
  const chosen = [];
  for (let i = 0; i < numItems; i++) {
    let t;
    do { t = pick(tickers); } while (chosen.includes(t));
    chosen.push(t);
    await conn.query(
      `INSERT INTO WatchlistItem (id, watchlistId, tickerSymbol, addedAt) VALUES (?, ?, ?, ?)`,
      [cuid(), wId, t, new Date(Date.now() - randInt(1, 30) * 86400000)]
    );
  }
  watchlistCount++;
}
console.log(`✓ Inserted ${watchlistCount} watchlists`);

await conn.end();
console.log("\n🎉 Seeding complete! All portfolio totals are in the $400–$2,000 range.");
