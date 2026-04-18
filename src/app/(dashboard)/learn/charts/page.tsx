"use client";

import { LessonLayout, Section, Paragraph, InfoCard, BulletList, ComparisonTable, CTAButton } from "@/components/learn/lesson-layout";
import { StockChart } from "@/components/trade/stock-chart";

export default function ChartsLesson() {
  return (
    <LessonLayout
      slug="charts"
      title="Reading Stock Charts"
      subtitle="Charts are the language of the market. Learn to read them fluently."
      readTime="8 min"
      difficulty="Beginner"
      accentColor="emerald"
      nextLesson={{ slug: "indicators", title: "Technical Indicators" }}
    >
      <Section title="Why Charts Matter">
        <Paragraph>
          Every professional trader starts by reading a chart. A stock chart shows you the price movement of a stock over time. 
          Instead of just seeing that Apple is trading at $195, a chart shows you <strong>how</strong> it got there — 
          was it surging upward, crashing down, or trading sideways? This context is everything.
        </Paragraph>
      </Section>

      <Section title="Line Charts vs. Candlestick Charts">
        <Paragraph>
          There are two main ways to visualize price data. Toggle between them in the interactive chart below to see the difference:
        </Paragraph>

        <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            🎮 Interactive — Toggle between Line and Candle mode, enable SMA overlays, and zoom
          </p>
          <StockChart symbol="AAPL" />
        </div>

        <ComparisonTable
          headers={["Feature", "Line Chart", "Candlestick Chart"]}
          rows={[
            ["Shows", "Closing price only", "Open, High, Low, Close (OHLC)"],
            ["Best for", "Quick trend view", "Detailed price action"],
            ["Used by", "Casual investors", "Active traders & professionals"],
            ["Complexity", "Simple", "More info per data point"],
          ]}
        />
      </Section>

      <Section title="Understanding Candlesticks">
        <Paragraph>
          Each candlestick represents one time period (1 day, 1 hour, etc.) and shows 4 data points:
        </Paragraph>
        <BulletList items={[
          "Open — the price when the period started",
          "Close — the price when the period ended",
          "High — the highest price reached during the period",
          "Low — the lowest price reached during the period",
        ]} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <div className="mb-3 flex flex-col items-center">
              <div className="h-3 w-0.5 bg-emerald-500" />
              <div className="h-12 w-6 rounded-sm bg-emerald-500" />
              <div className="h-5 w-0.5 bg-emerald-500" />
            </div>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Bullish (Green)</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Close &gt; Open = price went up</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-800/40 dark:bg-red-950/20">
            <div className="mb-3 flex flex-col items-center">
              <div className="h-5 w-0.5 bg-red-500" />
              <div className="h-12 w-6 rounded-sm bg-red-500" />
              <div className="h-3 w-0.5 bg-red-500" />
            </div>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">Bearish (Red)</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Close &lt; Open = price went down</span>
          </div>
        </div>

        <InfoCard type="key" title="Wicks Tell a Story">
          The thin lines above and below the body are called <strong>wicks</strong> (or shadows). Long wicks show that the price 
          moved significantly in one direction but was pushed back — a sign of strong buying or selling pressure.
        </InfoCard>
      </Section>

      <Section title="Volume — The Confirmation Signal">
        <Paragraph>
          Volume shows <strong>how many shares</strong> were traded during a period. It&apos;s displayed as bars at the bottom of the chart. 
          Volume is crucial because it confirms whether a price move is backed by real conviction:
        </Paragraph>
        <BulletList items={[
          "Rising price + rising volume = strong uptrend (buyers are committed)",
          "Rising price + falling volume = weak rally (could reverse soon)",
          "Falling price + rising volume = strong selloff (panic or conviction to sell)",
          "Falling price + falling volume = weak decline (sellers running out of steam)",
        ]} />
        <InfoCard type="tip">
          Enable the &quot;Vol&quot; checkbox on the chart above to see volume bars. Green bars = more buying; red = more selling.
        </InfoCard>
      </Section>

      <Section title="Choosing the Right Timeframe">
        <Paragraph>
          The timeframe you choose completely changes what the chart tells you:
        </Paragraph>
        <ComparisonTable
          headers={["Timeframe", "Best For", "Who Uses It"]}
          rows={[
            ["1D (1 Day)", "Intraday moves, entry/exit timing", "Day traders"],
            ["5D (1 Week)", "Short-term momentum", "Swing traders"],
            ["1M (1 Month)", "Recent trend direction", "Active investors"],
            ["3M–1Y", "Medium-term trends", "Growth investors"],
            ["5Y", "Long-term trajectory", "Long-term investors"],
          ]}
        />
        <InfoCard type="tip">
          As a beginner, the 1M and 3M views give you the best balance between seeing enough history and spotting recent trends.
        </InfoCard>
      </Section>

      <Section title="Try It Yourself">
        <Paragraph>
          The best way to learn chart reading is to practice. Head to the Trade tab and search for any stock — 
          try toggling between line and candle mode, zooming in, and observing how volume correlates with price moves.
        </Paragraph>
        <CTAButton href="/trade?symbol=AAPL">Practice with AAPL</CTAButton>
      </Section>
    </LessonLayout>
  );
}
