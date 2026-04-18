"use client";

import { LessonLayout, Section, Paragraph, InfoCard, BulletList, ComparisonTable, CTAButton } from "@/components/learn/lesson-layout";

export default function OrdersLesson() {
  return (
    <LessonLayout
      slug="orders"
      title="Order Types & Execution"
      subtitle="Know the difference between order types — it can save (or cost) you real money."
      readTime="7 min"
      difficulty="Beginner"
      accentColor="amber"
      prevLesson={{ slug: "fundamentals", title: "Fundamental Analysis" }}
      nextLesson={{ slug: "risk", title: "Risk Management" }}
    >
      <Section title="Why Order Types Matter">
        <Paragraph>
          Clicking &quot;Buy&quot; isn&apos;t as simple as it seems. <strong>How</strong> you buy matters just as much as <strong>what</strong> you buy. 
          Using the wrong order type can mean getting a worse price, missing the trade entirely, or losing money on a sudden dip. 
          Professional traders carefully choose the right order type for every situation.
        </Paragraph>
      </Section>

      <Section title="Market Orders">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400 mb-2">Market Order</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            &quot;Buy/sell immediately at whatever the current price is.&quot;
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1">✅ Pros</h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• Fastest execution</li>
                <li>• Guaranteed to fill</li>
                <li>• Simplest to use</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-500 mb-1">❌ Cons</h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• No price guarantee</li>
                <li>• May get &quot;slipped&quot; on volatile stocks</li>
                <li>• Bad for low-volume stocks</li>
              </ul>
            </div>
          </div>
        </div>
        <InfoCard type="tip">
          Use market orders when you <strong>need</strong> to execute immediately and the stock is liquid (high trading volume). 
          For any stock in the S&P 500, market orders are usually fine.
        </InfoCard>
      </Section>

      <Section title="Limit Orders">
        <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-5 dark:border-blue-800/40 dark:bg-blue-950/20">
          <h3 className="text-base font-bold text-blue-700 dark:text-blue-400 mb-2">Limit Order</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            &quot;Only buy/sell at this price <strong>or better</strong>.&quot;
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1">✅ Pros</h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• You control the price</li>
                <li>• No slippage</li>
                <li>• Set it and forget it</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-500 mb-1">❌ Cons</h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• May never fill</li>
                <li>• Stock might run away without you</li>
                <li>• Requires price conviction</li>
              </ul>
            </div>
          </div>
        </div>

        <Paragraph>
          <strong>Example:</strong> NVDA is trading at $880. You think it&apos;s worth buying at $850. You place a limit buy at $850 — 
          it will only execute if the price drops to $850 or lower. If it never dips, the order stays open.
        </Paragraph>
      </Section>

      <Section title="Stop-Loss Orders">
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-5 dark:border-rose-800/40 dark:bg-rose-950/20">
          <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 mb-2">Stop-Loss Order</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            &quot;If the price drops to this level, sell automatically to cut my losses.&quot;
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1">✅ Pros</h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• Limits downside risk</li>
                <li>• Removes emotional decisions</li>
                <li>• Protects gains on winning trades</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-500 mb-1">❌ Cons</h4>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• May trigger on a temporary dip</li>
                <li>• Becomes market order when triggered</li>
                <li>• Can lock in losses prematurely</li>
              </ul>
            </div>
          </div>
        </div>
        <InfoCard type="key">
          A stop-loss is your <strong>insurance policy</strong>. Professional traders ALWAYS have a stop-loss, even if they&apos;re confident in the trade. 
          The question isn&apos;t if you should use one — it&apos;s where to place it.
        </InfoCard>
      </Section>

      <Section title="Comparison at a Glance">
        <ComparisonTable
          headers={["Order Type", "Speed", "Price Control", "Best For"]}
          rows={[
            ["Market", "Instant ⚡", "None", "Liquid stocks, urgent trades"],
            ["Limit", "Depends ⏳", "Full control", "Specific entry points"],
            ["Stop-Loss", "When triggered", "Partial", "Risk protection"],
          ]}
        />
      </Section>

      <Section title="Bid/Ask Spread — The Hidden Cost">
        <Paragraph>
          Every stock has two prices: the <strong>bid</strong> (what buyers will pay) and the <strong>ask</strong> (what sellers want). 
          The difference is the spread, and it&apos;s a hidden cost of every trade.
        </Paragraph>
        <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
          <div className="flex items-center justify-center gap-8 mb-3">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bid</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">$194.98</p>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Spread</span>
              <p className="text-lg font-bold text-zinc-400">$0.04</p>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Ask</span>
              <p className="text-xl font-bold text-red-500 dark:text-red-400">$195.02</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 text-center">Tight spread = liquid stock. Wide spread = be careful with market orders.</p>
        </div>
        <InfoCard type="tip">
          High-volume stocks (AAPL, MSFT) have tight spreads of $0.01–$0.05. Low-volume stocks can have $0.50+ spreads — 
          that&apos;s money you lose instantly on every trade. Always check the spread before buying thinly-traded stocks.
        </InfoCard>
      </Section>

      <Section title="Practice Order Types">
        <Paragraph>
          QuantPlay supports all three order types. Go to the Trade tab, select any stock, and try placing a limit order or stop-loss 
          to see how they work — risk-free with virtual cash!
        </Paragraph>
        <CTAButton href="/trade">Place a Practice Order</CTAButton>
      </Section>
    </LessonLayout>
  );
}
