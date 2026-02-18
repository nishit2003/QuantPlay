// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// ─── Quote ──────────────────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  currency: string;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  epsTrailingTwelveMonths: number | null;
  priceToBook: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  averageDailyVolume3Month: number | null;
  dividendYield: number | null;
  sharesOutstanding: number | null;
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r: any = await yf.quote(symbol.toUpperCase());
    if (!r || !r.regularMarketPrice) return null;

    return {
      symbol: r.symbol,
      shortName: r.shortName ?? r.symbol,
      regularMarketPrice: r.regularMarketPrice,
      regularMarketChange: r.regularMarketChange ?? 0,
      regularMarketChangePercent: r.regularMarketChangePercent ?? 0,
      regularMarketPreviousClose: r.regularMarketPreviousClose ?? 0,
      regularMarketOpen: r.regularMarketOpen ?? 0,
      regularMarketDayHigh: r.regularMarketDayHigh ?? 0,
      regularMarketDayLow: r.regularMarketDayLow ?? 0,
      regularMarketVolume: r.regularMarketVolume ?? 0,
      currency: r.currency ?? "USD",
      marketCap: r.marketCap ?? null,
      trailingPE: r.trailingPE ?? null,
      forwardPE: r.forwardPE ?? null,
      epsTrailingTwelveMonths: r.epsTrailingTwelveMonths ?? null,
      priceToBook: r.priceToBook ?? null,
      fiftyTwoWeekHigh: r.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: r.fiftyTwoWeekLow ?? null,
      fiftyDayAverage: r.fiftyDayAverage ?? null,
      twoHundredDayAverage: r.twoHundredDayAverage ?? null,
      averageDailyVolume3Month: r.averageDailyVolume3Month ?? null,
      dividendYield: r.dividendYield ?? null,
      sharesOutstanding: r.sharesOutstanding ?? null,
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}

/** Fetch quotes for multiple symbols in parallel. Returns a map symbol -> quote (null if failed). */
export async function getQuotes(symbols: string[]): Promise<Record<string, StockQuote | null>> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean))];
  const results = await Promise.all(unique.map((s) => getQuote(s)));
  const out: Record<string, StockQuote | null> = {};
  unique.forEach((s, i) => { out[s] = results[i] ?? null; });
  return out;
}

// ─── Company Profile + Analyst Ratings ──────────────────────────────────────

export interface CompanyProfile {
  sector: string;
  industry: string;
  longBusinessSummary: string;
  website: string;
  fullTimeEmployees: number | null;
  city: string;
  state: string;
  country: string;
}

export interface AnalystRating {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  numberOfAnalysts: number | null;
}

export interface CompanyProfileResult {
  profile: CompanyProfile | null;
  analystRating: AnalystRating | null;
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfileResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quoteSummary(symbol.toUpperCase(), {
      modules: ["summaryProfile", "recommendationTrend", "financialData"],
    });

    let profile: CompanyProfile | null = null;
    const sp = result?.summaryProfile;
    if (sp) {
      profile = {
        sector: sp.sector ?? "",
        industry: sp.industry ?? "",
        longBusinessSummary: sp.longBusinessSummary ?? "",
        website: sp.website ?? "",
        fullTimeEmployees: sp.fullTimeEmployees ?? null,
        city: sp.city ?? "",
        state: sp.state ?? "",
        country: sp.country ?? "",
      };
    }

    let analystRating: AnalystRating | null = null;
    const trends = result?.recommendationTrend?.trend;
    const fd = result?.financialData;
    if (trends && trends.length > 0) {
      const current = trends[0];
      analystRating = {
        strongBuy: current.strongBuy ?? 0,
        buy: current.buy ?? 0,
        hold: current.hold ?? 0,
        sell: current.sell ?? 0,
        strongSell: current.strongSell ?? 0,
        targetMeanPrice: fd?.targetMeanPrice ?? null,
        targetHighPrice: fd?.targetHighPrice ?? null,
        targetLowPrice: fd?.targetLowPrice ?? null,
        numberOfAnalysts: fd?.numberOfAnalystOpinions ?? null,
      };
    }

    return { profile, analystRating };
  } catch (error) {
    console.error(`Failed to fetch profile for ${symbol}:`, error);
    return { profile: null, analystRating: null };
  }
}

// ─── Stock News ─────────────────────────────────────────────────────────────

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  thumbnail: string | null;
}

export async function getStockNews(symbol: string): Promise<NewsItem[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.search(symbol.toUpperCase(), {
      quotesCount: 0,
      newsCount: 10,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.news ?? []).slice(0, 8).map((n: any) => ({
      title: n.title ?? "",
      publisher: n.publisher ?? "",
      link: n.link ?? n.url ?? "#",
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime).toISOString()
        : new Date().toISOString(),
      thumbnail: n.thumbnail?.resolutions?.[0]?.url ?? null,
    }));
  } catch (error) {
    console.error(`Failed to fetch news for ${symbol}:`, error);
    return [];
  }
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  symbol: string;
  shortName: string;
  exchange: string;
  quoteType: string;
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.search(query, {
      quotesCount: 8,
      newsCount: 0,
    });

    return (result.quotes ?? [])
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q: any) =>
          q.quoteType === "EQUITY" && q.symbol && !q.symbol.includes(".")
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => ({
        symbol: q.symbol as string,
        shortName: (q.shortname ?? q.symbol) as string,
        exchange: (q.exchange ?? "") as string,
        quoteType: (q.quoteType ?? "EQUITY") as string,
      }))
      .slice(0, 6);
  } catch (error) {
    console.error(`Failed to search for "${query}":`, error);
    return [];
  }
}

// ─── Historical Chart ───────────────────────────────────────────────────────

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const RANGE_INTERVAL_MAP: Record<string, string> = {
  "1d": "5m",
  "5d": "15m",
  "1mo": "1d",
  "3mo": "1d",
  "1y": "1wk",
  "5y": "1mo",
};

export async function getHistory(symbol: string, range: string): Promise<HistoryPoint[]> {
  const interval = RANGE_INTERVAL_MAP[range] ?? "1d";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.chart(symbol.toUpperCase(), {
      period1: getStartDate(range),
      interval,
    });

    if (!result?.quotes) return [];

    return result.quotes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((q: any) => q.close != null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => ({
        date: new Date(q.date).toISOString(),
        open: q.open ?? 0,
        high: q.high ?? 0,
        low: q.low ?? 0,
        close: q.close,
        volume: q.volume ?? 0,
      }));
  } catch (error) {
    console.error(`Failed to fetch history for ${symbol}:`, error);
    return [];
  }
}

// ─── Market Discovery ────────────────────────────────────────────────────────

const MARKET_INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^DJI",  name: "Dow Jones" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "^RUT",  name: "Russell 2000" },
  { symbol: "^VIX",  name: "VIX" },
];

const DISCOVERY_POOL = [
  "AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","BRK-B","JPM","V",
  "UNH","JNJ","WMT","MA","PG","HD","XOM","CVX","LLY","ABBV",
  "MRK","KO","PEP","COST","AVGO","TMO","MCD","CSCO","ACN","ABT",
  "CRM","ORCL","AMD","INTC","NFLX","ADBE","QCOM","TXN","BA","GS",
  "PYPL","DIS","NKE","SBUX","SQ","SNAP","UBER","ABNB","RBLX","COIN",
  "PLTR","SOFI","RIVN","LCID","F","GM","T","VZ","PFE","BABA",
];

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface DiscoveryStock {
  symbol: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number | null;
}

export interface MarketDiscovery {
  indices: MarketIndex[];
  gainers: DiscoveryStock[];
  losers: DiscoveryStock[];
  mostActive: DiscoveryStock[];
  mostVolatile: DiscoveryStock[];
  trending: DiscoveryStock[];
}

export async function getMarketDiscovery(): Promise<MarketDiscovery> {
  try {
    const indexSymbols = MARKET_INDICES.map((i) => i.symbol);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [indexResults, stockResults]: [any[], any[]] = await Promise.all([
      yf.quote(indexSymbols),
      yf.quote(DISCOVERY_POOL),
    ]);

    const indices: MarketIndex[] = (indexResults ?? []).map((r: { symbol?: string; regularMarketPrice?: number; regularMarketChange?: number; regularMarketChangePercent?: number }) => {
      const meta = MARKET_INDICES.find((m) => m.symbol === r.symbol);
      return {
        symbol: r.symbol ?? "",
        name: meta?.name ?? r.symbol ?? "",
        price: r.regularMarketPrice ?? 0,
        change: r.regularMarketChange ?? 0,
        changePercent: r.regularMarketChangePercent ?? 0,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stocks: DiscoveryStock[] = (stockResults ?? [])
      .filter((r: { regularMarketPrice?: number }) => r.regularMarketPrice != null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        symbol: r.symbol ?? "",
        shortName: r.shortName ?? r.symbol ?? "",
        price: r.regularMarketPrice ?? 0,
        change: r.regularMarketChange ?? 0,
        changePercent: r.regularMarketChangePercent ?? 0,
        volume: r.regularMarketVolume ?? 0,
        marketCap: r.marketCap ?? null,
      }));

    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 6);
    const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).filter((s) => s.changePercent < 0).slice(0, 6);
    const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 6);
    const mostVolatile = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 6);

    const trendingPool = stocks.filter((s) => s.volume > 5_000_000 && Math.abs(s.changePercent) > 0.5);
    const trending = trendingPool.sort((a, b) => b.volume * Math.abs(b.changePercent) - a.volume * Math.abs(a.changePercent)).slice(0, 8);

    return { indices, gainers, losers, mostActive, mostVolatile, trending };
  } catch (error) {
    console.error("Failed to fetch market discovery:", error);
    return { indices: [], gainers: [], losers: [], mostActive: [], mostVolatile: [], trending: [] };
  }
}

function getStartDate(range: string): Date {
  const now = new Date();
  switch (range) {
    case "1d":
      return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    case "5d":
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case "1mo":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3mo":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "5y":
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}
