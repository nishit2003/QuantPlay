"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface GlossaryEntry {
  term: string;
  definition: string;
  module?: string; // link to relevant learn module
}

const GLOSSARY: GlossaryEntry[] = [
  { term: "Ask Price", definition: "The lowest price a seller is willing to accept for a stock.", module: "orders" },
  { term: "ATR (Average True Range)", definition: "A volatility indicator showing the average range of price movement over a period.", module: "indicators" },
  { term: "Bear Market", definition: "A market decline of 20% or more from recent highs, typically lasting months." },
  { term: "Beta", definition: "A measure of a stock's volatility relative to the overall market. Beta > 1 = more volatile than market." },
  { term: "Bid Price", definition: "The highest price a buyer is willing to pay for a stock.", module: "orders" },
  { term: "Bid-Ask Spread", definition: "The difference between the bid and ask price. Tight spreads indicate high liquidity.", module: "orders" },
  { term: "Blue Chip", definition: "A large, well-established company with a history of stable earnings (e.g., AAPL, MSFT, JNJ)." },
  { term: "Bollinger Bands", definition: "A volatility indicator with bands placed 2 standard deviations above and below a moving average.", module: "indicators" },
  { term: "Book Value", definition: "A company's total assets minus total liabilities. Used to calculate the P/B ratio.", module: "fundamentals" },
  { term: "Bull Market", definition: "A rising market, typically defined as a 20%+ increase from a recent low." },
  { term: "Candlestick", definition: "A chart element showing open, high, low, and close prices for a time period.", module: "charts" },
  { term: "Confirmation Bias", definition: "The tendency to only seek information that supports your existing belief about a trade.", module: "psychology" },
  { term: "Day Trading", definition: "Buying and selling a stock within the same trading day, holding no overnight positions." },
  { term: "Death Cross", definition: "When the 50-day moving average crosses below the 200-day MA — a bearish signal.", module: "indicators" },
  { term: "Diversification", definition: "Spreading investments across multiple stocks, sectors, or asset classes to reduce risk.", module: "risk" },
  { term: "Dividend", definition: "A portion of a company's profits paid to shareholders, usually quarterly.", module: "fundamentals" },
  { term: "Dividend Yield", definition: "Annual dividend per share divided by the stock price. 3% yield = $3/year per $100 invested.", module: "fundamentals" },
  { term: "EMA (Exponential Moving Average)", definition: "A moving average that gives more weight to recent prices, reacting faster to changes.", module: "indicators" },
  { term: "EPS (Earnings Per Share)", definition: "A company's net income divided by shares outstanding. Measures profitability.", module: "fundamentals" },
  { term: "ETF (Exchange-Traded Fund)", definition: "A fund that tracks an index, sector, or asset class and trades like a stock (e.g., SPY, QQQ)." },
  { term: "Fill", definition: "When your order is executed — your buy or sell went through at a specific price.", module: "orders" },
  { term: "FOMO", definition: "Fear Of Missing Out — buying impulsively because a stock is surging and you don't want to miss it.", module: "psychology" },
  { term: "Fundamental Analysis", definition: "Evaluating a stock by studying the company's financials, earnings, and competitive position.", module: "fundamentals" },
  { term: "Golden Cross", definition: "When the 50-day moving average crosses above the 200-day MA — a bullish signal.", module: "indicators" },
  { term: "IPO (Initial Public Offering)", definition: "When a private company first sells shares to the public on a stock exchange." },
  { term: "Large-Cap", definition: "Companies with market capitalization between $10B and $200B.", module: "fundamentals" },
  { term: "Limit Order", definition: "An order to buy/sell only at a specified price or better. Gives price control but may not fill.", module: "orders" },
  { term: "Liquidity", definition: "How easily a stock can be bought or sold without significantly affecting its price." },
  { term: "Loss Aversion", definition: "The psychological tendency to feel losses more strongly (2x) than equivalent gains.", module: "psychology" },
  { term: "MACD", definition: "Moving Average Convergence Divergence — shows the relationship between two moving averages to identify momentum.", module: "indicators" },
  { term: "Market Cap", definition: "Stock price × shares outstanding. Represents the total market value of a company.", module: "fundamentals" },
  { term: "Market Order", definition: "An order to buy/sell immediately at the best available price. Fast but no price guarantee.", module: "orders" },
  { term: "Mega-Cap", definition: "Companies with market capitalization over $200B (e.g., AAPL, MSFT, GOOGL).", module: "fundamentals" },
  { term: "Moving Average", definition: "The average closing price over a specified period, used to smooth out price noise.", module: "indicators" },
  { term: "OHLC", definition: "Open, High, Low, Close — the four data points shown in each candlestick.", module: "charts" },
  { term: "P/B Ratio (Price-to-Book)", definition: "Stock price divided by book value per share. P/B < 1 may indicate undervaluation.", module: "fundamentals" },
  { term: "P/E Ratio (Price-to-Earnings)", definition: "Stock price divided by earnings per share. Measures how much you pay per dollar of earnings.", module: "fundamentals" },
  { term: "Paper Trading", definition: "Practicing trades with virtual money instead of real capital — exactly what QuantPlay provides!" },
  { term: "Position Sizing", definition: "Determining how many shares to buy based on your risk tolerance and stop-loss level.", module: "risk" },
  { term: "Resistance", definition: "A price level where a stock tends to stop rising due to selling pressure." },
  { term: "Revenge Trading", definition: "Taking impulsive, oversized trades to 'win back' money lost on previous trades.", module: "psychology" },
  { term: "Risk/Reward Ratio", definition: "The potential profit compared to potential loss on a trade. 1:3 means risking $1 to make $3.", module: "risk" },
  { term: "RSI (Relative Strength Index)", definition: "A momentum indicator (0-100). Above 70 = overbought, below 30 = oversold.", module: "indicators" },
  { term: "Sector", definition: "A category of companies with similar business activities (e.g., Technology, Healthcare, Finance)." },
  { term: "Short Selling", definition: "Selling borrowed shares, hoping to buy them back at a lower price for a profit." },
  { term: "Slippage", definition: "The difference between the expected price and the actual fill price of a market order.", module: "orders" },
  { term: "SMA (Simple Moving Average)", definition: "The average closing price over N periods, with equal weight to each data point.", module: "indicators" },
  { term: "Small-Cap", definition: "Companies with market capitalization between $300M and $2B.", module: "fundamentals" },
  { term: "Stop-Loss", definition: "An order to sell if the price drops to a specified level, limiting potential losses.", module: "orders" },
  { term: "Support", definition: "A price level where a stock tends to stop falling due to buying interest." },
  { term: "Swing Trading", definition: "Holding positions for days to weeks, capturing medium-term price moves." },
  { term: "Technical Analysis", definition: "Studying price charts and indicators to predict future price movements.", module: "indicators" },
  { term: "Trailing Stop", definition: "A stop-loss that moves up with the stock price, locking in profits as the trade progresses.", module: "risk" },
  { term: "Trend", definition: "The overall direction a stock is moving — uptrend, downtrend, or sideways.", module: "charts" },
  { term: "Volatility", definition: "How much and how quickly a stock's price moves. High volatility = bigger swings." },
  { term: "Volume", definition: "The number of shares traded during a period. High volume confirms price moves.", module: "charts" },
  { term: "Watchlist", definition: "A curated list of stocks you're monitoring for potential trades." },
  { term: "Wick (Shadow)", definition: "The thin line above/below a candlestick body, showing the high/low reached.", module: "charts" },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = GLOSSARY;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
      );
    }
    if (activeFilter) {
      list = list.filter((e) => e.module === activeFilter);
    }
    return list;
  }, [search, activeFilter]);

  const letters = useMemo(() => {
    const set = new Set(filtered.map((e) => e.term[0].toUpperCase()));
    return [...set].sort();
  }, [filtered]);

  const moduleFilters = [
    { key: "charts", label: "Charts", color: "emerald" },
    { key: "indicators", label: "Indicators", color: "blue" },
    { key: "fundamentals", label: "Fundamentals", color: "violet" },
    { key: "orders", label: "Orders", color: "amber" },
    { key: "risk", label: "Risk", color: "rose" },
    { key: "psychology", label: "Psychology", color: "cyan" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Back */}
      <Link href="/learn" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Academy
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Trading Glossary</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{GLOSSARY.length} terms every trader should know</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full rounded-xl border border-zinc-200/60 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-white transition"
        />
      </div>

      {/* Module filters */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveFilter(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            !activeFilter
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        {moduleFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === f.key
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400">
          No terms match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => {
            const items = filtered.filter((e) => e.term[0].toUpperCase() === letter);
            return (
              <div key={letter}>
                <div className="sticky top-0 z-10 mb-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {letter}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.map((entry) => (
                    <div
                      key={entry.term}
                      className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900 transition hover:border-zinc-300 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{entry.term}</h3>
                          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{entry.definition}</p>
                        </div>
                        {entry.module && (
                          <Link
                            href={`/learn/${entry.module}`}
                            className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-500 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition"
                          >
                            Learn →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
