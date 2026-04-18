"use client";

import { useState } from "react";
import { LessonLayout, Section, Paragraph, InfoCard, BulletList, ComparisonTable, CTAButton } from "@/components/learn/lesson-layout";

function RiskCalculator() {
  const [capital, setCapital] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [entryPrice, setEntryPrice] = useState("100");
  const [stopPrice, setStopPrice] = useState("95");

  const cap = parseFloat(capital) || 0;
  const risk = parseFloat(riskPercent) || 0;
  const entry = parseFloat(entryPrice) || 0;
  const stop = parseFloat(stopPrice) || 0;

  const riskAmount = cap * (risk / 100);
  const diff = entry - stop;
  const shares = diff > 0 ? Math.floor(riskAmount / diff) : 0;
  const positionSize = shares * entry;

  return (
    <div className="rounded-xl border border-rose-200/60 bg-rose-50/30 p-5 dark:border-rose-800/40 dark:bg-rose-950/20">
      <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3">🧮 Position Size Calculator</h4>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Total Capital ($)</label>
          <input type="number" value={capital} onChange={(e) => setCapital(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Risk Per Trade (%)</label>
          <input type="number" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Entry Price ($)</label>
          <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Stop-Loss Price ($)</label>
          <input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 rounded-lg bg-white p-3 dark:bg-zinc-900">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Max Risk</span>
          <p className="text-base font-bold text-rose-600 dark:text-rose-400">${riskAmount.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Shares</span>
          <p className="text-base font-bold text-zinc-900 dark:text-white">{shares}</p>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Position Size</span>
          <p className="text-base font-bold text-zinc-900 dark:text-white">${positionSize.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default function RiskLesson() {
  return (
    <LessonLayout
      slug="risk"
      title="Risk Management"
      subtitle="The #1 skill that separates profitable traders from broke ones."
      readTime="9 min"
      difficulty="Intermediate"
      accentColor="rose"
      prevLesson={{ slug: "orders", title: "Order Types" }}
      nextLesson={{ slug: "psychology", title: "Trading Psychology" }}
    >
      <Section title="The Most Important Rule in Trading">
        <Paragraph>
          Here&apos;s a secret every professional knows: <strong>risk management is more important than stock selection</strong>. 
          You can pick mediocre stocks and still make money with great risk management. But pick amazing stocks with terrible 
          risk management, and you&apos;ll blow up your account.
        </Paragraph>
        <InfoCard type="key">
          The goal isn&apos;t to never lose money. It&apos;s to <strong>lose small</strong> on bad trades and <strong>win big</strong> on good ones. 
          If you risk $1 to make $3, you only need to be right 30% of the time to be profitable.
        </InfoCard>
      </Section>

      <Section title="The 1% and 2% Rules">
        <Paragraph>
          Professional traders never risk more than a small percentage of their total capital on a single trade:
        </Paragraph>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1">The 1% Rule (Conservative)</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Never risk more than 1% of your capital per trade. With $1,000 → max $10 risk per trade.</p>
          </div>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">The 2% Rule (Moderate)</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Never risk more than 2% of your capital per trade. With $1,000 → max $20 risk per trade.</p>
          </div>
        </div>
        <InfoCard type="info">
          With the 1% rule, you could lose 20 trades in a row and still have 82% of your capital left. With no risk management, 
          one bad trade could wipe out 50%+ of your account.
        </InfoCard>
      </Section>

      <Section title="Position Sizing">
        <Paragraph>
          Position sizing answers: <strong>&quot;How many shares should I buy?&quot;</strong> It&apos;s calculated based on your risk tolerance and stop-loss level. 
          Try the calculator below:
        </Paragraph>
        <RiskCalculator />
        <Paragraph>
          The calculator above shows that even with a $1,000 account and 2% risk, you might only buy 4 shares of a $100 stock — 
          not the 10 you&apos;d buy if you went &quot;all in.&quot; This is how professionals think.
        </Paragraph>
      </Section>

      <Section title="Stop-Loss Placement Strategies">
        <Paragraph>
          Where you place your stop-loss is just as important as having one. Here are common strategies:
        </Paragraph>
        <ComparisonTable
          headers={["Strategy", "How", "When to Use"]}
          rows={[
            ["Percentage", "Set stop 5-10% below entry", "Simple, good for beginners"],
            ["Support level", "Below a key price support", "When you know technical analysis"],
            ["ATR-based", "2× Average True Range below entry", "Adapts to stock's volatility"],
            ["Trailing stop", "Moves up as price rises", "To lock in profits on a winner"],
          ]}
        />
        <InfoCard type="warning">
          Never move your stop-loss DOWN (further from your entry). If you find yourself wanting to do this, the trade thesis is 
          likely broken and you should consider exiting. Discipline protects capital.
        </InfoCard>
      </Section>

      <Section title="Diversification: Don't Put All Eggs in One Basket">
        <Paragraph>
          Diversification means spreading your money across different stocks and sectors so that one bad pick doesn&apos;t destroy your portfolio.
        </Paragraph>
        <BulletList items={[
          "Don't put more than 10-20% of your portfolio in any single stock",
          "Spread across 5+ different sectors (tech, healthcare, finance, etc.)",
          "Consider including ETFs like SPY for broad market exposure",
          "Correlation matters — owning AAPL, MSFT, and GOOGL isn't diversified (all big tech)",
          "International stocks can provide geographic diversification",
        ]} />
      </Section>

      <Section title="Risk/Reward Ratio">
        <Paragraph>
          Before any trade, calculate: <strong>how much can I lose vs. how much can I gain?</strong>
        </Paragraph>

        <div className="rounded-xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="text-lg font-bold text-red-600 dark:text-red-400">$1</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 mt-1">RISK</span>
            </div>
            <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">$3</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 mt-1">REWARD</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 text-center">A 1:3 risk/reward ratio — you need to win only 25% of trades to break even!</p>
        </div>

        <BulletList items={[
          "1:1 ratio → Need 50% win rate → Break-even (bad)",
          "1:2 ratio → Need 33% win rate → Profitable",
          "1:3 ratio → Need 25% win rate → Very profitable",
          "Always aim for at least 1:2 risk/reward on every trade",
        ]} />
      </Section>

      <Section title="Apply What You Learned">
        <Paragraph>
          Practice risk management on QuantPlay. When you place a trade, think about: What&apos;s my stop-loss? 
          What&apos;s my target? Am I risking less than 2% of my portfolio?
        </Paragraph>
        <CTAButton href="/trade">Practice Risk Management</CTAButton>
      </Section>
    </LessonLayout>
  );
}
