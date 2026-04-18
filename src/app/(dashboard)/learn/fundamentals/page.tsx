"use client";

import { LessonLayout, Section, Paragraph, InfoCard, BulletList, ComparisonTable, CTAButton } from "@/components/learn/lesson-layout";

export default function FundamentalsLesson() {
  return (
    <LessonLayout
      slug="fundamentals"
      title="Fundamental Analysis"
      subtitle="Learn to judge whether a stock is cheap, fairly valued, or expensive."
      readTime="10 min"
      difficulty="Intermediate"
      accentColor="violet"
      prevLesson={{ slug: "indicators", title: "Technical Indicators" }}
      nextLesson={{ slug: "orders", title: "Order Types" }}
    >
      <Section title="Technical vs. Fundamental Analysis">
        <Paragraph>
          Technical analysis studies <strong>charts and patterns</strong> — where the price has been and where it might go. 
          Fundamental analysis studies the <strong>company itself</strong> — is it actually a good business worth the price? 
          The best traders use both.
        </Paragraph>
        <InfoCard type="info">
          Warren Buffett, the most successful investor in history, is primarily a fundamental analyst. He buys companies, not charts.
        </InfoCard>
      </Section>

      <Section title="P/E Ratio (Price-to-Earnings)">
        <Paragraph>
          The P/E ratio is the most widely used valuation metric. It tells you <strong>how much investors are paying per dollar of earnings</strong>.
        </Paragraph>

        <div className="rounded-xl border border-violet-200/60 bg-violet-50/50 p-5 dark:border-violet-800/40 dark:bg-violet-950/20">
          <div className="text-center mb-3">
            <span className="text-lg font-mono font-bold text-violet-700 dark:text-violet-400">
              P/E = Stock Price ÷ Earnings Per Share
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
            A stock at $100 with $5 EPS has a P/E of 20 — you pay $20 for each $1 of earnings.
          </p>
        </div>

        <ComparisonTable
          headers={["P/E Range", "Interpretation", "Typical Sectors"]}
          rows={[
            ["< 15", "Potentially undervalued", "Banks, utilities, energy"],
            ["15–25", "Fairly valued", "Consumer goods, industrials"],
            ["25–40", "Growth premium", "Tech, healthcare"],
            ["> 40", "High growth expected or overvalued", "High-growth tech, speculative"],
          ]}
        />

        <InfoCard type="warning">
          A low P/E doesn&apos;t always mean &quot;cheap.&quot; Sometimes it means the market expects declining earnings. Similarly, a high P/E 
          doesn&apos;t mean &quot;expensive&quot; — it could reflect fast growth. Always look at <strong>why</strong> the P/E is what it is.
        </InfoCard>
      </Section>

      <Section title="EPS (Earnings Per Share)">
        <Paragraph>
          EPS shows <strong>how much profit a company earns for each share</strong> of stock outstanding. Rising EPS usually drives rising stock prices.
        </Paragraph>

        <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
          <div className="text-center mb-2">
            <span className="text-base font-mono font-bold text-zinc-700 dark:text-zinc-300">
              EPS = Net Income ÷ Shares Outstanding
            </span>
          </div>
        </div>

        <BulletList items={[
          "Growing EPS quarter-over-quarter → company is becoming more profitable",
          "EPS beat (actual > estimate) → stock usually jumps on earnings day",
          "EPS miss (actual < estimate) → stock usually drops",
          "Diluted EPS accounts for stock options and convertible debt — more conservative",
        ]} />
      </Section>

      <Section title="Market Capitalization">
        <Paragraph>
          Market cap tells you the <strong>total value of a company</strong> — it&apos;s the stock price multiplied by the number of shares outstanding.
        </Paragraph>

        <ComparisonTable
          headers={["Category", "Market Cap", "Examples", "Risk/Reward"]}
          rows={[
            ["Mega-cap", "> $200B", "AAPL, MSFT, GOOGL", "Low risk, steady growth"],
            ["Large-cap", "$10B–$200B", "NFLX, AMD, BA", "Moderate risk"],
            ["Mid-cap", "$2B–$10B", "DASH, SNAP", "Higher growth potential"],
            ["Small-cap", "$300M–$2B", "Newer companies", "High risk, high reward"],
            ["Micro-cap", "< $300M", "Very small companies", "Very high risk"],
          ]}
        />

        <InfoCard type="tip">
          As a beginner, stick to large-cap and mega-cap stocks. They&apos;re more stable, more liquid, and have more analyst coverage — 
          so you can learn without wild, unpredictable swings.
        </InfoCard>
      </Section>

      <Section title="Other Key Metrics">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">P/B Ratio (Price-to-Book)</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Compares stock price to book value (assets minus liabilities). P/B &lt; 1 could mean undervalued.</p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Dividend Yield</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Annual dividend ÷ stock price. A 3% yield means $3/year for every $100 invested.</p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Revenue Growth</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Year-over-year revenue growth shows whether the company is still expanding. Growth stocks typically grow 20%+.</p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Debt-to-Equity</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Total debt ÷ shareholder equity. Below 1 is healthy; above 2 may signal too much leverage.</p>
          </div>
        </div>
      </Section>

      <Section title="Reading an Earnings Report (Simplified)">
        <Paragraph>
          Every quarter, public companies release an earnings report. Here&apos;s what matters most:
        </Paragraph>
        <BulletList items={[
          "Revenue — Did overall sales grow compared to last quarter/year?",
          "EPS — Did the company beat or miss analyst estimates?",
          "Guidance — What does management expect for next quarter? (This often moves the stock more than actual results)",
          "Margins — Is the company becoming more or less profitable?",
          "Notable items — New product launches, acquisitions, layoffs, lawsuits",
        ]} />
        <InfoCard type="key">
          Wall Street is <strong>forward-looking</strong>. A company can report great earnings and still see its stock drop if 
          the guidance for next quarter disappoints. It&apos;s not about the past — it&apos;s about expectations for the future.
        </InfoCard>
      </Section>

      <Section title="See Fundamentals in Action">
        <Paragraph>
          QuantPlay shows key statistics for every stock — P/E, EPS, market cap, and more. Search any stock in the Trade tab 
          and scroll down to &quot;Key Statistics&quot; to see these metrics live.
        </Paragraph>
        <CTAButton href="/trade?symbol=MSFT">Analyze MSFT Fundamentals</CTAButton>
      </Section>
    </LessonLayout>
  );
}
