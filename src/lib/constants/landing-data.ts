/**
 * Landing page content. Single source of truth so each section stays DRY
 * and the page composition reads as a narrative, not a wall of strings.
 */

export const SITE_COPY = {
  heroEyebrow: "Paper trading. Real markets. Zero risk.",
  heroTitle: "Master the markets.",
  heroTitleAccent: "Risk-free.",
  heroSubtitle:
    "Start with $1,000 in virtual cash. Trade real-time stocks, build systematic plans, and compete on the global leaderboard — all without risking a dollar.",
  heroPrimaryCta: { label: "Start free", href: "/sign-up" },
  heroSecondaryCta: { label: "Sign in", href: "/sign-in" },
  finalCtaTitle: "Your edge starts here.",
  finalCtaSubtitle:
    "Join thousands of traders sharpening their strategy on QuantPlay. No card. No commitment. Just markets.",
  finalCtaButton: "Claim your $1,000",
} as const;

/* ─── Hero ticker (visual flavour only — values are static demo data) ─── */
export const HERO_TICKERS = [
  { sym: "AAPL", price: 232.14, change: 1.42 },
  { sym: "NVDA", price: 875.30, change: 3.18 },
  { sym: "MSFT", price: 428.91, change: 0.87 },
  { sym: "TSLA", price: 248.50, change: -2.04 },
  { sym: "GOOGL", price: 174.22, change: 1.10 },
  { sym: "META", price: 512.66, change: 2.31 },
  { sym: "AMZN", price: 188.40, change: 0.55 },
  { sym: "AMD", price: 162.18, change: -1.23 },
  { sym: "BTC", price: 67421.10, change: 2.94 },
  { sym: "SPY", price: 548.72, change: 0.42 },
  { sym: "QQQ", price: 467.13, change: 0.73 },
  { sym: "JPM", price: 218.06, change: -0.31 },
] as const;

/* ─── Section 2: Two journeys ─── */
export const AUDIENCE_TRACKS = [
  {
    id: "BEGINNER",
    label: "I'm new to trading",
    headline: "Learn the language of the markets.",
    points: [
      "Start with $1,000 in virtual cash",
      "Bite-sized lessons on charts, candles & risk",
      "Guided first trade with explainers",
      "Earn achievements as you grow",
    ],
    accent: "from-emerald-500/30 to-teal-500/10",
    icon: "🌱",
  },
  {
    id: "QUANT",
    label: "I'm a serious trader",
    headline: "Pressure-test your edge.",
    points: [
      "Live screener across 5,000+ tickers",
      "Limit, stop-loss & systematic auto-invest",
      "Equity curve, sector exposure, P&L journal",
      "Weekly contests with global rankings",
    ],
    accent: "from-violet-500/30 to-blue-500/10",
    icon: "📐",
  },
] as const;

/* ─── Section 3: Sticky scroll showcase ─── */
export const PLATFORM_CAPABILITIES = [
  {
    id: "TRADE",
    eyebrow: "Execute",
    title: "Real-time trading. Real-time conviction.",
    desc: "Live quotes powered by Yahoo Finance. Place market, limit, and stop-loss orders across thousands of US equities — exactly the way the pros do it.",
    href: "/trade",
  },
  {
    id: "AUTO_INVEST",
    eyebrow: "Automate",
    title: "Set it. And actually forget it.",
    desc: "Dollar-cost average into any ticker daily, weekly, or monthly. Recurring orders run on the cron — no babysitting, no missed entries.",
    href: "/auto-invest",
  },
  {
    id: "SCREENER",
    eyebrow: "Discover",
    title: "Find the next move in seconds.",
    desc: "Filter 5,000+ stocks by sector, market cap, P/E, dividend yield, gainers and losers. Sort, search, and pivot without ever leaving the page.",
    href: "/screener",
  },
  {
    id: "ALERTS",
    eyebrow: "React",
    title: "The market never sleeps. You can.",
    desc: "Set price-cross alerts for any ticker. We'll watch the tape and ping you the moment your level prints — above or below, your call.",
    href: "/alerts",
  },
] as const;

/* ─── Section 4: Journal preview ─── */
export const JOURNAL_HIGHLIGHTS = {
  eyebrow: "Reflect",
  title: "Know yourself. Know your edge.",
  desc: "Every fill is logged automatically. Watch your equity curve, sector exposure, win rate, and most-traded tickers evolve as you trade.",
  metrics: [
    { label: "Net P&L", value: "+$3,128.40", positive: true },
    { label: "Win rate", value: "63%", positive: true },
    { label: "Trades", value: "184", positive: true },
    { label: "Best sector", value: "Tech", positive: true },
  ],
  sectorMix: [
    { name: "Technology", weight: 0.42, color: "#10b981" },
    { name: "Finance", weight: 0.18, color: "#3b82f6" },
    { name: "Consumer", weight: 0.14, color: "#8b5cf6" },
    { name: "Energy", weight: 0.11, color: "#f59e0b" },
    { name: "Healthcare", weight: 0.09, color: "#ec4899" },
    { name: "Other", weight: 0.06, color: "#6366f1" },
  ],
} as const;

/* ─── Section 5: Pulse (news / earnings / economic) ─── */
export const PULSE_SECTION = {
  eyebrow: "Stay ahead",
  title: "The whole market in one view.",
  desc: "Breaking headlines, upcoming earnings, and macro events — curated and time-stamped. No tabs. No noise.",
  newsItems: [
    { tag: "Markets", title: "Fed signals patience as inflation cools to 2.4%", time: "12m ago" },
    { tag: "Tech", title: "NVIDIA breaks $4T market cap on AI demand", time: "38m ago" },
    { tag: "Earnings", title: "Apple beats EPS, services revenue at record high", time: "1h ago" },
    { tag: "Macro", title: "Jobless claims fall to 4-month low", time: "2h ago" },
  ],
  earnings: [
    { ticker: "AAPL", date: "Apr 24", time: "AMC", eps: 1.62 },
    { ticker: "MSFT", date: "Apr 22", time: "AMC", eps: 3.22 },
    { ticker: "NVDA", date: "May 28", time: "AMC", eps: 0.89 },
    { ticker: "TSLA", date: "Apr 22", time: "AMC", eps: 0.42 },
  ],
  economic: [
    { event: "FOMC Rate Decision", date: "Apr 30", impact: "High" },
    { event: "Non-Farm Payrolls", date: "May 02", impact: "High" },
    { event: "CPI Inflation", date: "May 13", impact: "High" },
  ],
} as const;

/* ─── Section 6: Compete (leaderboard) ─── */
export interface LeaderboardRow {
  rank: number;
  name: string;
  returnPct: number;
  value: number;
  badge?: string;
  isMe?: boolean;
}

export const COMPETE_SECTION: {
  eyebrow: string;
  title: string;
  desc: string;
  rankings: LeaderboardRow[];
} = {
  eyebrow: "Compete",
  title: "Climb the global leaderboard.",
  desc: "Every Friday at 4pm ET we lock in returns, crown a winner, and reset the clock. The whole world is your trading desk.",
  rankings: [
    { rank: 1, name: "Alex Morgan", returnPct: 18.2, value: 45_210, badge: "👑" },
    { rank: 2, name: "Jordan Lee", returnPct: 16.4, value: 12_400, badge: "🥈" },
    { rank: 3, name: "Sam Patel", returnPct: 14.1, value: 89_000, badge: "🥉" },
    { rank: 4, name: "You", returnPct: 12.4, value: 142_894, badge: "🚀", isMe: true },
    { rank: 5, name: "Riley Chen", returnPct: 11.8, value: 28_650 },
  ],
};

/* ─── Section 7: Achievements ─── */
export const ACHIEVEMENT_PREVIEW = {
  eyebrow: "Earn",
  title: "Every milestone, marked.",
  desc: "From your first trade to a 30-day streak — 23 achievements across four rarities. Common to Legendary.",
  badges: [
    { icon: "🐣", title: "First Steps", rarity: "Common" as const },
    { icon: "🛡️", title: "Risk Manager", rarity: "Common" as const },
    { icon: "🎯", title: "Sharpshooter", rarity: "Rare" as const },
    { icon: "🦈", title: "Shark", rarity: "Rare" as const },
    { icon: "🐋", title: "Whale", rarity: "Epic" as const },
    { icon: "🔥", title: "Monthly Master", rarity: "Epic" as const },
    { icon: "👑", title: "Top 10", rarity: "Legendary" as const },
    { icon: "🎓", title: "Academy Graduate", rarity: "Rare" as const },
  ],
} as const;

/* ─── Section 8: Academy ─── */
export const ACADEMY_SECTION = {
  eyebrow: "Learn",
  title: "From candlesticks to algorithms.",
  desc: "Six self-paced modules built for every level. Each one ends with a knowledge check before you trade live.",
  modules: [
    {
      slug: "charts",
      title: "Reading Stock Charts",
      blurb: "Line vs candlestick, OHLC, timeframes, volume — the foundation.",
      level: "Beginner" as const,
      readTime: "8 min",
      icon: "📊",
      tone: "from-emerald-500/20 to-teal-500/10",
    },
    {
      slug: "indicators",
      title: "Technical Indicators",
      blurb: "SMA, EMA, RSI, MACD, Bollinger Bands — decode the signals.",
      level: "Intermediate" as const,
      readTime: "12 min",
      icon: "📈",
      tone: "from-blue-500/20 to-indigo-500/10",
    },
    {
      slug: "fundamentals",
      title: "Fundamental Analysis",
      blurb: "P/E, EPS, market cap — judge if a stock is cheap or expensive.",
      level: "Intermediate" as const,
      readTime: "10 min",
      icon: "🏛️",
      tone: "from-violet-500/20 to-purple-500/10",
    },
    {
      slug: "orders",
      title: "Order Types",
      blurb: "Market, limit, stop-loss — the mechanics of every trade.",
      level: "Beginner" as const,
      readTime: "6 min",
      icon: "🎯",
      tone: "from-amber-500/20 to-orange-500/10",
    },
    {
      slug: "psychology",
      title: "Trader Psychology",
      blurb: "Discipline, FOMO, revenge trading — the inner game.",
      level: "Advanced" as const,
      readTime: "14 min",
      icon: "🧠",
      tone: "from-pink-500/20 to-rose-500/10",
    },
    {
      slug: "risk",
      title: "Risk Management",
      blurb: "Position sizing, R-multiples, expectancy — survive to thrive.",
      level: "Advanced" as const,
      readTime: "11 min",
      icon: "🛡️",
      tone: "from-cyan-500/20 to-sky-500/10",
    },
  ],
} as const;

/* ─── Section 9: Stats ─── */
export const PLATFORM_STATS = [
  { v: 5000, suffix: "+", title: "Tradable assets" },
  { v: 23, suffix: "", title: "Achievements to earn" },
  { v: 6, suffix: "", title: "Academy modules" },
  { v: 1000, suffix: "", title: "Virtual cash, day one", prefix: "$" },
] as const;

/* ─── Footer ─── */
export const FOOTER_LINKS = {
  product: [
    { label: "Trade", href: "/trade" },
    { label: "Auto-Invest", href: "/auto-invest" },
    { label: "Screener", href: "/screener" },
    { label: "Leaderboard", href: "/leaderboard" },
  ],
  learn: [
    { label: "Academy", href: "/learn" },
    { label: "Indicators", href: "/learn/indicators" },
    { label: "Risk", href: "/learn/risk" },
    { label: "Psychology", href: "/learn/psychology" },
  ],
  account: [
    { label: "Sign up", href: "/sign-up" },
    { label: "Sign in", href: "/sign-in" },
  ],
} as const;
