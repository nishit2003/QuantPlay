/**
 * Market data: when FINNHUB_API_KEY is set we use both — Finnhub for real-time
 * price, Yahoo for volume, fundamentals, discovery structure, and analyst data.
 */

import * as finnhub from "./finnhub";
import * as yahoo from "./yahoo";

function useBoth(): boolean {
  return typeof process !== "undefined" && !!process.env.FINNHUB_API_KEY;
}

export type {
  StockQuote,
  CompanyProfile,
  AnalystRating,
  CompanyProfileResult,
  NewsItem,
  SearchResult,
  HistoryPoint,
  MarketIndex,
  DiscoveryStock,
  MarketDiscovery,
} from "./yahoo";

type StockQuote = yahoo.StockQuote;

function mergeQuote(fh: finnhub.StockQuote | null, yh: yahoo.StockQuote | null): StockQuote | null {
  if (fh && yh) {
    return {
      ...yh,
      regularMarketPrice: fh.regularMarketPrice,
      regularMarketChange: fh.regularMarketChange,
      regularMarketChangePercent: fh.regularMarketChangePercent,
      regularMarketPreviousClose: fh.regularMarketPreviousClose,
      regularMarketOpen: fh.regularMarketOpen,
      regularMarketDayHigh: fh.regularMarketDayHigh,
      regularMarketDayLow: fh.regularMarketDayLow,
      symbol: fh.symbol,
    };
  }
  return fh ?? yh;
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  if (!useBoth()) return yahoo.getQuote(symbol);
  const [fh, yh] = await Promise.all([finnhub.getQuote(symbol), yahoo.getQuote(symbol)]);
  return mergeQuote(fh, yh);
}

export async function getQuotes(symbols: string[]): Promise<Record<string, StockQuote | null>> {
  if (!useBoth()) return yahoo.getQuotes(symbols);
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean))];
  const [fhMap, yhMap] = await Promise.all([finnhub.getQuotes(unique), yahoo.getQuotes(unique)]);
  const out: Record<string, StockQuote | null> = {};
  for (const s of unique) {
    out[s] = mergeQuote(fhMap[s] ?? null, yhMap[s] ?? null);
  }
  return out;
}

export async function getCompanyProfile(symbol: string): Promise<yahoo.CompanyProfileResult> {
  if (!useBoth()) return yahoo.getCompanyProfile(symbol);
  const [fh, yh] = await Promise.all([
    finnhub.getCompanyProfile(symbol),
    yahoo.getCompanyProfile(symbol),
  ]);
  return {
    profile: fh.profile ?? yh.profile ?? null,
    analystRating: yh.analystRating ?? null,
  };
}

export async function getStockNews(symbol: string): Promise<yahoo.NewsItem[]> {
  if (!useBoth()) return yahoo.getStockNews(symbol);
  const [fhNews, yhNews] = await Promise.all([
    finnhub.getStockNews(symbol),
    yahoo.getStockNews(symbol),
  ]);
  const seen = new Set<string>();
  const combined = [...fhNews, ...yhNews]
    .filter((n) => {
      const key = (n.title || n.link).toLowerCase().slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 10);
  return combined;
}

export async function searchSymbols(query: string): Promise<yahoo.SearchResult[]> {
  if (!useBoth()) return yahoo.searchSymbols(query);
  const [fhRes, yhRes] = await Promise.all([
    finnhub.searchSymbols(query),
    yahoo.searchSymbols(query),
  ]);
  const bySymbol = new Map<string, yahoo.SearchResult>();
  [...fhRes, ...yhRes].forEach((r) => {
    const s = r.symbol.toUpperCase();
    if (!bySymbol.has(s)) bySymbol.set(s, { ...r, symbol: s });
  });
  return [...bySymbol.values()].slice(0, 8);
}

export async function getHistory(symbol: string, range: string): Promise<yahoo.HistoryPoint[]> {
  if (!useBoth()) return yahoo.getHistory(symbol, range);
  const fh = await finnhub.getHistory(symbol, range);
  if (fh.length > 0) return fh;
  return yahoo.getHistory(symbol, range);
}

const INDEX_YAHOO_TO_FINNHUB: Record<string, string> = {
  "^GSPC": "SPY",
  "^DJI": "DIA",
  "^IXIC": "QQQ",
  "^RUT": "IWM",
  "^VIX": "VIXY",
};

export async function getMarketDiscovery(): Promise<yahoo.MarketDiscovery> {
  if (!useBoth()) return yahoo.getMarketDiscovery();
  const yhDisc = await yahoo.getMarketDiscovery();
  const indexFhSymbols = yhDisc.indices.map((i) => INDEX_YAHOO_TO_FINNHUB[i.symbol] ?? i.symbol);
  const stockSymbols = [
    ...new Set([
      ...yhDisc.gainers.map((s) => s.symbol),
      ...yhDisc.losers.map((s) => s.symbol),
      ...yhDisc.mostActive.map((s) => s.symbol),
      ...yhDisc.mostVolatile.map((s) => s.symbol),
      ...yhDisc.trending.map((s) => s.symbol),
    ]),
  ];
  const fhQuotes = await finnhub.getQuotes([...indexFhSymbols, ...stockSymbols]);
  const applyPrice = (item: { symbol: string; price: number; change: number; changePercent: number }, fhSymbol?: string) => {
    const sym = fhSymbol ?? item.symbol;
    const q = fhQuotes[sym];
    if (q) {
      item.price = q.regularMarketPrice;
      item.change = q.regularMarketChange;
      item.changePercent = q.regularMarketChangePercent;
    }
  };
  yhDisc.indices.forEach((item, i) => applyPrice(item, indexFhSymbols[i]));
  yhDisc.gainers.forEach((s) => applyPrice(s));
  yhDisc.losers.forEach((s) => applyPrice(s));
  yhDisc.mostActive.forEach((s) => applyPrice(s));
  yhDisc.mostVolatile.forEach((s) => applyPrice(s));
  yhDisc.trending.forEach((s) => applyPrice(s));
  return yhDisc;
}
