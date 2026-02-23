/**
 * Finnhub market data — real-time, accurate. Use when FINNHUB_API_KEY is set.
 * Same interface as yahoo.ts so the app can swap providers.
 */

import { TtlCache } from "./cache";

const BASE = "https://finnhub.io/api/v1";
const quoteCache = new TtlCache<StockQuote>(15_000);

function token(): string {
  const t = process.env.FINNHUB_API_KEY;
  if (!t) throw new Error("FINNHUB_API_KEY is required");
  return t;
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(path, BASE);
  url.searchParams.set("token", token());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Finnhub ${path} ${res.status}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Finnhub ${path} non-JSON response`);
  }
}

// ─── Types (match yahoo.ts) ───────────────────────────────────────────────────

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

interface FinnhubQuote {
  c: number;   // current
  d: number;   // change
  dp: number;  // percent change
  h: number;   // high
  l: number;   // low
  o: number;   // open
  pc: number;  // previous close
  t?: number;
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  const key = symbol.toUpperCase();
  const cached = quoteCache.get(key);
  if (cached) return cached;

  try {
    const q = await get<FinnhubQuote>("quote", { symbol: key });
    if (q.c == null || q.c === 0) return null;
    const quote: StockQuote = {
      symbol: key,
      shortName: key,
      regularMarketPrice: q.c,
      regularMarketChange: q.d ?? 0,
      regularMarketChangePercent: q.dp ?? 0,
      regularMarketPreviousClose: q.pc ?? q.c,
      regularMarketOpen: q.o ?? q.c,
      regularMarketDayHigh: q.h ?? q.c,
      regularMarketDayLow: q.l ?? q.c,
      regularMarketVolume: 0,
      currency: "USD",
      marketCap: null,
      trailingPE: null,
      forwardPE: null,
      epsTrailingTwelveMonths: null,
      priceToBook: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      fiftyDayAverage: null,
      twoHundredDayAverage: null,
      averageDailyVolume3Month: null,
      dividendYield: null,
      sharesOutstanding: null,
    };
    quoteCache.set(key, quote);
    return quote;
  } catch {
    // Finnhub may return HTML (proxy/error page) or 429; fall back to Yahoo via merge layer
    return null;
  }
}

export async function getQuotes(symbols: string[]): Promise<Record<string, StockQuote | null>> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean))];
  const results = await Promise.all(unique.map((s) => getQuote(s)));
  const out: Record<string, StockQuote | null> = {};
  unique.forEach((s, i) => { out[s] = results[i] ?? null; });
  return out;
}

// ─── Company Profile + Analyst ────────────────────────────────────────────────

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

interface FinnhubProfile2 {
  name?: string;
  country?: string;
  industry?: string;
  weburl?: string;
  finnhubIndustry?: string;
  exchange?: string;
  marketCapitalization?: number;
  shareOutstanding?: number;
  description?: string;
  employment?: number;
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfileResult> {
  try {
    const p = await get<FinnhubProfile2>("stock/profile2", { symbol: symbol.toUpperCase() });
    const profile: CompanyProfile = {
      sector: p.finnhubIndustry ?? p.industry ?? "",
      industry: p.industry ?? p.finnhubIndustry ?? "",
      longBusinessSummary: p.description ?? "",
      website: p.weburl ?? "",
      fullTimeEmployees: p.employment ?? null,
      city: "",
      state: "",
      country: p.country ?? "",
    };
    return { profile, analystRating: null };
  } catch (e) {
    console.error(`Finnhub profile ${symbol}:`, e);
    return { profile: null, analystRating: null };
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  thumbnail: string | null;
}

interface FinnhubNewsItem {
  headline?: string;
  source?: string;
  url?: string;
  datetime?: number;
  image?: string;
}

export async function getStockNews(symbol: string): Promise<NewsItem[]> {
  try {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    const list = await get<FinnhubNewsItem[]>("company-news", {
      symbol: symbol.toUpperCase(),
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
    return (list ?? []).slice(0, 8).map((n) => ({
      title: n.headline ?? "",
      publisher: n.source ?? "",
      link: n.url ?? "#",
      publishedAt: n.datetime ? new Date(n.datetime * 1000).toISOString() : new Date().toISOString(),
      thumbnail: n.image ?? null,
    }));
  } catch (e) {
    console.error(`Finnhub news ${symbol}:`, e);
    return [];
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  symbol: string;
  shortName: string;
  exchange: string;
  quoteType: string;
}

interface FinnhubSearchResult {
  count?: number;
  result?: { symbol?: string; description?: string; displaySymbol?: string; type?: string }[];
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const data = await get<FinnhubSearchResult>("search", { q: query.trim() });
    const list = data.result ?? [];
    return list
      .filter((r) => {
        if (!r.symbol) return false;
        const t = r.type?.toLowerCase() ?? "";
        return t.includes("stock") || t.includes("etp") || t.includes("etf");
      })
      .map((r) => ({
        symbol: r.symbol ?? "",
        shortName: r.description ?? r.displaySymbol ?? r.symbol ?? "",
        exchange: "",
        quoteType: r.type?.toLowerCase().includes("stock") ? "EQUITY" : "ETF",
      }))
      .slice(0, 6);
  } catch (e) {
    console.error(`Finnhub search "${query}":`, e);
    return [];
  }
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const RANGE_RESOLUTION: Record<string, string> = {
  "1d": "5",
  "5d": "15",
  "1mo": "D",
  "3mo": "D",
  "1y": "W",
  "5y": "M",
};

interface FinnhubCandle {
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  t?: number[];
}

function rangeToFromTo(range: string): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const day = 24 * 60 * 60;
  switch (range) {
    case "1d": return { from: now - 1 * day, to: now };
    case "5d": return { from: now - 5 * day, to: now };
    case "1mo": return { from: now - 30 * day, to: now };
    case "3mo": return { from: now - 90 * day, to: now };
    case "1y": return { from: now - 365 * day, to: now };
    case "5y": return { from: now - 5 * 365 * day, to: now };
    default: return { from: now - 30 * day, to: now };
  }
}

export async function getHistory(symbol: string, range: string): Promise<HistoryPoint[]> {
  try {
    const res = RANGE_RESOLUTION[range] ?? "D";
    const { from, to } = rangeToFromTo(range);
    const data = await get<FinnhubCandle>("stock/candle", {
      symbol: symbol.toUpperCase(),
      resolution: res,
      from: String(from),
      to: String(to),
    });
    const t = data.t ?? [];
    const o = data.o ?? [];
    const h = data.h ?? [];
    const l = data.l ?? [];
    const c = data.c ?? [];
    const v = data.v ?? [];
    if (t.length === 0) return [];
    return t.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString(),
      open: o[i] ?? 0,
      high: h[i] ?? 0,
      low: l[i] ?? 0,
      close: c[i] ?? 0,
      volume: v[i] ?? 0,
    }));
  } catch (e) {
    console.error(`Finnhub history ${symbol}:`, e);
    return [];
  }
}

// ─── Market Discovery ─────────────────────────────────────────────────────────

const MARKET_INDICES = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "DIA", name: "Dow Jones" },
  { symbol: "QQQ", name: "Nasdaq" },
  { symbol: "IWM", name: "Russell 2000" },
  { symbol: "VIXY", name: "VIX" },
];

const DISCOVERY_POOL = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B", "JPM", "V",
  "UNH", "JNJ", "WMT", "MA", "PG", "HD", "XOM", "CVX", "LLY", "ABBV",
  "MRK", "KO", "PEP", "COST", "AVGO", "TMO", "MCD", "CSCO", "ACN", "ABT",
  "CRM", "ORCL", "AMD", "INTC", "NFLX", "ADBE", "QCOM", "TXN", "BA", "GS",
  "PYPL", "DIS", "NKE", "SBUX", "SQ", "SNAP", "UBER", "ABNB", "RBLX", "COIN",
  "PLTR", "SOFI", "RIVN", "LCID", "F", "GM", "T", "VZ", "PFE", "BABA",
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
    const allSymbols = [...MARKET_INDICES.map((i) => i.symbol), ...DISCOVERY_POOL];
    const quotes = await getQuotes(allSymbols);
    const indexQuotes = MARKET_INDICES.map((m) => ({ ...m, q: quotes[m.symbol] }));
    const indices: MarketIndex[] = indexQuotes.map(({ symbol, name, q }) => ({
      symbol,
      name,
      price: q?.regularMarketPrice ?? 0,
      change: q?.regularMarketChange ?? 0,
      changePercent: q?.regularMarketChangePercent ?? 0,
    }));
    const stocks: DiscoveryStock[] = DISCOVERY_POOL.filter((s) => quotes[s] != null).map((s) => {
      const q = quotes[s]!;
      return {
        symbol: q.symbol,
        shortName: q.shortName ?? q.symbol,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        volume: q.regularMarketVolume,
        marketCap: q.marketCap,
      };
    });
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 6);
    const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).filter((s) => s.changePercent < 0).slice(0, 6);
    const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 6);
    const mostVolatile = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 6);
    const trendingPool = stocks.filter((s) => s.volume > 5_000_000 && Math.abs(s.changePercent) > 0.5);
    const trending = trendingPool.sort((a, b) => b.volume * Math.abs(b.changePercent) - a.volume * Math.abs(a.changePercent)).slice(0, 8);
    return { indices, gainers, losers, mostActive, mostVolatile, trending };
  } catch (e) {
    console.error("Finnhub market discovery:", e);
    return { indices: [], gainers: [], losers: [], mostActive: [], mostVolatile: [], trending: [] };
  }
}
