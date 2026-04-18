// Local ticker database for client-side fallback search
// Used when the API is unavailable or returns no results

export interface LocalTicker {
  symbol: string;
  name: string;
  exchange: string;
}

export const LOCAL_TICKERS: LocalTicker[] = [
  // Technology
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ" },
  { symbol: "ORCL", name: "Oracle Corporation", exchange: "NYSE" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ" },
  { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE" },
  { symbol: "CSCO", name: "Cisco Systems Inc.", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", exchange: "NASDAQ" },
  { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ" },
  { symbol: "QCOM", name: "QUALCOMM Inc.", exchange: "NASDAQ" },
  { symbol: "INTU", name: "Intuit Inc.", exchange: "NASDAQ" },
  { symbol: "TXN", name: "Texas Instruments Inc.", exchange: "NASDAQ" },
  { symbol: "IBM", name: "International Business Machines", exchange: "NYSE" },
  { symbol: "AMAT", name: "Applied Materials Inc.", exchange: "NASDAQ" },
  { symbol: "NOW", name: "ServiceNow Inc.", exchange: "NYSE" },
  { symbol: "SHOP", name: "Shopify Inc.", exchange: "NYSE" },
  { symbol: "SNOW", name: "Snowflake Inc.", exchange: "NYSE" },
  { symbol: "NET", name: "Cloudflare Inc.", exchange: "NYSE" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ" },
  { symbol: "UBER", name: "Uber Technologies Inc.", exchange: "NYSE" },

  // Finance
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE" },
  { symbol: "BAC", name: "Bank of America Corp.", exchange: "NYSE" },
  { symbol: "GS", name: "Goldman Sachs Group", exchange: "NYSE" },
  { symbol: "WFC", name: "Wells Fargo & Company", exchange: "NYSE" },
  { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE" },
  { symbol: "AXP", name: "American Express Company", exchange: "NYSE" },
  { symbol: "BLK", name: "BlackRock Inc.", exchange: "NYSE" },
  { symbol: "SCHW", name: "Charles Schwab Corp.", exchange: "NYSE" },
  { symbol: "C", name: "Citigroup Inc.", exchange: "NYSE" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", exchange: "NASDAQ" },
  { symbol: "SQ", name: "Block Inc.", exchange: "NYSE" },
  { symbol: "COIN", name: "Coinbase Global Inc.", exchange: "NASDAQ" },
  { symbol: "SOFI", name: "SoFi Technologies Inc.", exchange: "NASDAQ" },

  // Healthcare
  { symbol: "UNH", name: "UnitedHealth Group Inc.", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE" },
  { symbol: "LLY", name: "Eli Lilly and Company", exchange: "NYSE" },
  { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE" },
  { symbol: "MRK", name: "Merck & Co. Inc.", exchange: "NYSE" },
  { symbol: "PFE", name: "Pfizer Inc.", exchange: "NYSE" },
  { symbol: "TMO", name: "Thermo Fisher Scientific", exchange: "NYSE" },
  { symbol: "ABT", name: "Abbott Laboratories", exchange: "NYSE" },
  { symbol: "AMGN", name: "Amgen Inc.", exchange: "NASDAQ" },
  { symbol: "GILD", name: "Gilead Sciences Inc.", exchange: "NASDAQ" },
  { symbol: "BMY", name: "Bristol-Myers Squibb Co.", exchange: "NYSE" },
  { symbol: "MRNA", name: "Moderna Inc.", exchange: "NASDAQ" },

  // Consumer
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
  { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE" },
  { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE" },
  { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ" },
  { symbol: "COST", name: "Costco Wholesale Corp.", exchange: "NASDAQ" },
  { symbol: "MCD", name: "McDonald's Corporation", exchange: "NYSE" },
  { symbol: "NKE", name: "NIKE Inc.", exchange: "NYSE" },
  { symbol: "SBUX", name: "Starbucks Corporation", exchange: "NASDAQ" },
  { symbol: "HD", name: "The Home Depot Inc.", exchange: "NYSE" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", exchange: "NYSE" },
  { symbol: "TGT", name: "Target Corporation", exchange: "NYSE" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE" },
  { symbol: "ABNB", name: "Airbnb Inc.", exchange: "NASDAQ" },
  { symbol: "BKNG", name: "Booking Holdings Inc.", exchange: "NASDAQ" },

  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE" },
  { symbol: "CVX", name: "Chevron Corporation", exchange: "NYSE" },
  { symbol: "COP", name: "ConocoPhillips", exchange: "NYSE" },
  { symbol: "SLB", name: "Schlumberger Limited", exchange: "NYSE" },
  { symbol: "EOG", name: "EOG Resources Inc.", exchange: "NYSE" },

  // Communication
  { symbol: "T", name: "AT&T Inc.", exchange: "NYSE" },
  { symbol: "VZ", name: "Verizon Communications", exchange: "NYSE" },
  { symbol: "CMCSA", name: "Comcast Corporation", exchange: "NASDAQ" },
  { symbol: "TMUS", name: "T-Mobile US Inc.", exchange: "NASDAQ" },

  // Industrial
  { symbol: "BA", name: "The Boeing Company", exchange: "NYSE" },
  { symbol: "CAT", name: "Caterpillar Inc.", exchange: "NYSE" },
  { symbol: "UPS", name: "United Parcel Service", exchange: "NYSE" },
  { symbol: "HON", name: "Honeywell International", exchange: "NASDAQ" },
  { symbol: "GE", name: "GE Aerospace", exchange: "NYSE" },
  { symbol: "RTX", name: "RTX Corporation", exchange: "NYSE" },
  { symbol: "LMT", name: "Lockheed Martin Corp.", exchange: "NYSE" },
  { symbol: "DE", name: "Deere & Company", exchange: "NYSE" },
  { symbol: "FDX", name: "FedEx Corporation", exchange: "NYSE" },

  // Fintech / Growth
  { symbol: "PLTR", name: "Palantir Technologies", exchange: "NYSE" },
  { symbol: "SNAP", name: "Snap Inc.", exchange: "NYSE" },
  { symbol: "RBLX", name: "Roblox Corporation", exchange: "NYSE" },
  { symbol: "RIVN", name: "Rivian Automotive Inc.", exchange: "NASDAQ" },
  { symbol: "LCID", name: "Lucid Group Inc.", exchange: "NASDAQ" },
  { symbol: "F", name: "Ford Motor Company", exchange: "NYSE" },
  { symbol: "GM", name: "General Motors Company", exchange: "NYSE" },

  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF", exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "NASDAQ" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", exchange: "NYSE" },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", exchange: "NYSE" },
  { symbol: "ARKK", name: "ARK Innovation ETF", exchange: "NYSE" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", exchange: "NYSE" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", exchange: "NYSE" },
  { symbol: "BABA", name: "Alibaba Group Holdings", exchange: "NYSE" },

  // Real Estate
  { symbol: "AMT", name: "American Tower Corp.", exchange: "NYSE" },
  { symbol: "O", name: "Realty Income Corporation", exchange: "NYSE" },

  // Materials
  { symbol: "LIN", name: "Linde plc", exchange: "NASDAQ" },
  { symbol: "FCX", name: "Freeport-McMoRan Inc.", exchange: "NYSE" },
  { symbol: "NEM", name: "Newmont Corporation", exchange: "NYSE" },
];

/**
 * Search the local ticker database. Returns matches ranked by relevance.
 * Matches ticker symbols first (prefix match), then company names.
 */
export function searchLocalTickers(query: string, limit = 6): LocalTicker[] {
  if (!query.trim()) return [];
  const q = query.trim().toUpperCase();

  // Exact symbol match first
  const exact = LOCAL_TICKERS.filter((t) => t.symbol === q);

  // Symbol prefix match
  const symbolPrefix = LOCAL_TICKERS.filter(
    (t) => t.symbol !== q && t.symbol.startsWith(q)
  );

  // Name contains match (case insensitive)
  const qLower = query.trim().toLowerCase();
  const nameMatch = LOCAL_TICKERS.filter(
    (t) => !t.symbol.startsWith(q) && t.name.toLowerCase().includes(qLower)
  );

  return [...exact, ...symbolPrefix, ...nameMatch].slice(0, limit);
}
