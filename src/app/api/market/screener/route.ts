import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getQuotes } from "@/lib/market";

// Expanded stock pool for the screener — 100 stocks across sectors
const SCREENER_POOL = [
  // Technology
  "AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","CRM","ADBE","INTC","AMD","QCOM","TXN","AVGO","ORCL","CSCO","IBM","SHOP","SNOW","NET",
  // Finance
  "JPM","V","MA","GS","BAC","WFC","MS","AXP","BLK","SCHW",
  // Healthcare
  "UNH","JNJ","LLY","ABBV","MRK","PFE","TMO","ABT","AMGN","GILD",
  // Consumer
  "WMT","PG","KO","PEP","COST","MCD","NKE","SBUX","HD","LOW",
  // Energy
  "XOM","CVX","COP","SLB","EOG",
  // Communication
  "DIS","NFLX","CMCSA","T","VZ",
  // Industrial
  "BA","CAT","UPS","HON","GE",
  // Fintech / Growth
  "SQ","PYPL","COIN","SOFI","PLTR","UBER","ABNB","RBLX","SNAP","RIVN",
  // ETFs
  "SPY","QQQ","IWM","DIA","ARKK",
];

// Sector mapping for each ticker
const SECTOR_MAP: Record<string, string> = {
  AAPL:"Technology",MSFT:"Technology",GOOGL:"Technology",AMZN:"Technology",NVDA:"Technology",META:"Technology",TSLA:"Technology",
  CRM:"Technology",ADBE:"Technology",INTC:"Technology",AMD:"Technology",QCOM:"Technology",TXN:"Technology",AVGO:"Technology",
  ORCL:"Technology",CSCO:"Technology",IBM:"Technology",SHOP:"Technology",SNOW:"Technology",NET:"Technology",
  JPM:"Finance",V:"Finance",MA:"Finance",GS:"Finance",BAC:"Finance",WFC:"Finance",MS:"Finance",AXP:"Finance",BLK:"Finance",SCHW:"Finance",
  UNH:"Healthcare",JNJ:"Healthcare",LLY:"Healthcare",ABBV:"Healthcare",MRK:"Healthcare",PFE:"Healthcare",TMO:"Healthcare",ABT:"Healthcare",AMGN:"Healthcare",GILD:"Healthcare",
  WMT:"Consumer",PG:"Consumer",KO:"Consumer",PEP:"Consumer",COST:"Consumer",MCD:"Consumer",NKE:"Consumer",SBUX:"Consumer",HD:"Consumer",LOW:"Consumer",
  XOM:"Energy",CVX:"Energy",COP:"Energy",SLB:"Energy",EOG:"Energy",
  DIS:"Communication",NFLX:"Communication",CMCSA:"Communication",T:"Communication",VZ:"Communication",
  BA:"Industrial",CAT:"Industrial",UPS:"Industrial",HON:"Industrial",GE:"Industrial",
  SQ:"Fintech",PYPL:"Fintech",COIN:"Fintech",SOFI:"Fintech",PLTR:"Fintech",UBER:"Fintech",ABNB:"Fintech",RBLX:"Fintech",SNAP:"Fintech",RIVN:"Fintech",
  SPY:"ETF",QQQ:"ETF",IWM:"ETF",DIA:"ETF",ARKK:"ETF",
};

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  try {
    const quotes = await getQuotes(SCREENER_POOL);
    const stocks = SCREENER_POOL
      .map((sym) => {
        const q = quotes[sym];
        if (!q) return null;
        return {
          symbol: q.symbol,
          shortName: q.shortName,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          volume: q.regularMarketVolume,
          marketCap: q.marketCap,
          pe: q.trailingPE,
          eps: q.epsTrailingTwelveMonths,
          divYield: q.dividendYield,
          w52High: q.fiftyTwoWeekHigh,
          w52Low: q.fiftyTwoWeekLow,
          avgVolume: q.averageDailyVolume3Month,
          sector: SECTOR_MAP[q.symbol] ?? "Other",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ stocks });
  } catch (error) {
    console.error("Screener error:", error);
    return NextResponse.json({ stocks: [] });
  }
}
