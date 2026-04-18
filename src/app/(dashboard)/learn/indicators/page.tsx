"use client";

import { LessonLayout, Section, Paragraph, InfoCard, BulletList, ComparisonTable, CTAButton } from "@/components/learn/lesson-layout";

export default function IndicatorsLesson() {
  return (
    <LessonLayout
      slug="indicators"
      title="Technical Indicators"
      subtitle="Decode the signals that professional traders rely on every day."
      readTime="12 min"
      difficulty="Intermediate"
      accentColor="blue"
      prevLesson={{ slug: "charts", title: "Reading Charts" }}
      nextLesson={{ slug: "fundamentals", title: "Fundamental Analysis" }}
    >
      <Section title="What Are Technical Indicators?">
        <Paragraph>
          Technical indicators are mathematical calculations applied to price and volume data. They help traders identify trends, 
          momentum, and potential reversals. Think of them as &quot;lenses&quot; that highlight patterns invisible to the naked eye.
        </Paragraph>
        <InfoCard type="info">
          No single indicator is perfect. Professionals combine multiple indicators to confirm signals — this is called <strong>confluence</strong>.
        </InfoCard>
      </Section>

      <Section title="Moving Averages (SMA & EMA)">
        <Paragraph>
          A <strong>Moving Average</strong> smooths out price data by calculating the average closing price over a specific period. 
          It filters out day-to-day noise so you can spot the actual trend.
        </Paragraph>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-4 dark:border-blue-800/40 dark:bg-blue-950/20">
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">SMA (Simple Moving Average)</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Equal weight to all prices in the period. SMA-20 = average of last 20 closing prices.</p>
          </div>
          <div className="rounded-xl border border-orange-200/60 bg-orange-50/50 p-4 dark:border-orange-800/40 dark:bg-orange-950/20">
            <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-1">EMA (Exponential Moving Average)</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Gives more weight to recent prices, so it reacts faster to new price changes.</p>
          </div>
        </div>

        <InfoCard type="key" title="The Golden Cross & Death Cross">
          When the 50-day MA crosses <strong>above</strong> the 200-day MA, it&apos;s called a <strong>Golden Cross</strong> — a bullish signal. 
          When it crosses <strong>below</strong>, it&apos;s a <strong>Death Cross</strong> — bearish. These are widely watched by institutional traders.
        </InfoCard>

        <ComparisonTable
          headers={["Period", "Name", "Used For"]}
          rows={[
            ["20-day", "Short-term MA", "Swing trading, intraday trends"],
            ["50-day", "Medium-term MA", "Intermediate trend direction"],
            ["200-day", "Long-term MA", "Major trend; institutional benchmark"],
          ]}
        />

        <InfoCard type="tip">
          You can toggle SMA-20 and SMA-50 overlays on QuantPlay&apos;s stock chart. Try it on the Trade page!
        </InfoCard>
      </Section>

      <Section title="RSI (Relative Strength Index)">
        <Paragraph>
          The RSI measures <strong>momentum</strong> — how fast and how much a stock is moving. It oscillates between 0 and 100.
        </Paragraph>

        <div className="rounded-xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <div className="relative h-20 mb-4">
            {/* RSI visualization */}
            <div className="absolute inset-x-0 top-0 flex h-full flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-red-300 dark:bg-red-800" />
                <span className="text-[10px] font-bold text-red-500">70 — Overbought</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-[10px] text-zinc-400">50 — Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-emerald-300 dark:bg-emerald-800" />
                <span className="text-[10px] font-bold text-emerald-500">30 — Oversold</span>
              </div>
            </div>
          </div>
          <BulletList items={[
            "RSI > 70 → Stock may be overbought (price could drop soon)",
            "RSI < 30 → Stock may be oversold (potential buying opportunity)",
            "RSI near 50 → No strong momentum in either direction",
          ]} />
        </div>

        <InfoCard type="warning">
          An RSI above 70 doesn&apos;t mean you should sell immediately! During strong bull runs, stocks can stay overbought for weeks. 
          Use RSI as a warning sign, not an automatic trigger.
        </InfoCard>
      </Section>

      <Section title="MACD (Moving Average Convergence Divergence)">
        <Paragraph>
          MACD shows the relationship between two moving averages of a stock&apos;s price. It consists of three components:
        </Paragraph>
        <BulletList items={[
          "MACD Line — the difference between the 12-day and 26-day EMA",
          "Signal Line — a 9-day EMA of the MACD line",
          "Histogram — the visual gap between the MACD and signal lines",
        ]} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1">🟢 Bullish Signal</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">MACD line crosses ABOVE the signal line → momentum is shifting upward.</p>
          </div>
          <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-800/40 dark:bg-red-950/20">
            <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">🔴 Bearish Signal</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">MACD line crosses BELOW the signal line → momentum is shifting downward.</p>
          </div>
        </div>
      </Section>

      <Section title="Bollinger Bands">
        <Paragraph>
          Bollinger Bands consist of a moving average with two bands plotted 2 standard deviations above and below it. 
          They expand and contract based on <strong>volatility</strong>.
        </Paragraph>
        <BulletList items={[
          "Squeeze (bands narrow) → Low volatility; a breakout is coming soon",
          "Price touches upper band → Stock may be overbought",
          "Price touches lower band → Stock may be oversold",
          "Walking the band → During strong trends, price hugs one band",
        ]} />
        <InfoCard type="key">
          The &quot;Bollinger Squeeze&quot; is one of the most reliable setups. When bands get extremely narrow, it signals that a big move is imminent — 
          you just don&apos;t know which direction. Watch the breakout direction to decide.
        </InfoCard>
      </Section>

      <Section title="Putting It All Together">
        <Paragraph>
          No indicator works in isolation. Here&apos;s a simple framework professionals use:
        </Paragraph>
        <BulletList items={[
          "Use Moving Averages to identify the trend (is the stock trending up or down?)",
          "Use RSI to gauge momentum (is it overbought or oversold?)",
          "Use MACD to confirm trend changes (is momentum shifting?)",
          "Use Bollinger Bands for volatility context (is a big move coming?)",
          "Always confirm with volume — is the move backed by real conviction?",
        ]} />
        <CTAButton href="/trade">Practice on a Live Chart</CTAButton>
      </Section>
    </LessonLayout>
  );
}
