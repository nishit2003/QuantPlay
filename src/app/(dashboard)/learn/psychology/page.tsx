"use client";

import { LessonLayout, Section, Paragraph, InfoCard, BulletList } from "@/components/learn/lesson-layout";

export default function PsychologyLesson() {
  return (
    <LessonLayout
      slug="psychology"
      title="Trading Psychology"
      subtitle="Your biggest opponent isn't the market — it's your own mind."
      readTime="8 min"
      difficulty="Advanced"
      accentColor="cyan"
      prevLesson={{ slug: "risk", title: "Risk Management" }}
    >
      <Section title="Why Psychology Is the Hardest Part">
        <Paragraph>
          You can learn every chart pattern, memorize every indicator, and master every order type — and still lose money. Why? 
          Because <strong>emotions</strong> override logic. Fear makes you sell at the bottom. Greed makes you hold too long. 
          The best traders aren&apos;t the smartest — they&apos;re the most disciplined.
        </Paragraph>
        <InfoCard type="key">
          Studies show that the average retail investor underperforms the market by 4-5% annually, <strong>not</strong> because of bad 
          stock picks, but because of poorly timed buys and sells driven by emotion.
        </InfoCard>
      </Section>

      <Section title="FOMO — Fear Of Missing Out">
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-5 dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="text-2xl mb-2">😰</div>
          <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 mb-2">The Scenario</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            A stock you were watching just surged 30% in a week. Twitter is buzzing. Your friend just made $500 on it. 
            You panic-buy at the top because you &quot;can&apos;t miss out.&quot;
          </p>
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">What Actually Happens</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            By the time FOMO drives you to buy, the easy money has already been made. You&apos;re buying from the people 
            who got in early and are now selling to you at a premium. The stock drops 15% the next week.
          </p>
        </div>
        <InfoCard type="tip" title="How to Beat FOMO">
          &quot;If you missed the bus, don&apos;t chase it — there&apos;s always another one.&quot; Markets present new opportunities every single day. 
          No single trade is your last chance. Stick to your watchlist and wait for YOUR setup at YOUR price.
        </InfoCard>
      </Section>

      <Section title="Loss Aversion — Why Losses Hurt 2x More">
        <div className="rounded-xl border border-red-200/60 bg-red-50/30 p-5 dark:border-red-800/40 dark:bg-red-950/20">
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-2">The Science</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Nobel Prize-winning research by Kahneman & Tversky proved that <strong>losing $100 causes twice the emotional pain 
            as gaining $100 causes pleasure</strong>. This wiring makes traders:
          </p>
          <BulletList items={[
            "Hold losing positions too long, hoping they'll recover (\"it'll come back\")",
            "Sell winning positions too early, locking in small profits out of fear",
            "Avoid taking necessary losses, turning small losses into catastrophic ones",
          ]} />
        </div>
        <InfoCard type="key" title="The Fix">
          Before entering any trade, define your exit — both the stop-loss AND the profit target. Write them down. 
          Once set, execute mechanically. Let the trade play out without second-guessing.
        </InfoCard>
      </Section>

      <Section title="Confirmation Bias — Seeing What You Want to See">
        <Paragraph>
          Once you&apos;re bullish on a stock, your brain automatically filters information to support that view:
        </Paragraph>
        <BulletList items={[
          "You read 10 articles but only remember the 3 bullish ones",
          "You ignore the declining revenue because the product \"seems cool\"",
          "You dismiss bearish analysts as \"not understanding the company\"",
          "You join Reddit communities that echo your position",
        ]} />
        <InfoCard type="warning" title="This Is Dangerous">
          Actively seek out the <strong>bear case</strong> for every stock you own. If you can&apos;t articulate why you might be wrong, 
          you don&apos;t understand the trade well enough. The best investors actively try to prove themselves wrong.
        </InfoCard>
      </Section>

      <Section title="Revenge Trading — Chasing Your Losses">
        <div className="rounded-xl border border-violet-200/60 bg-violet-50/30 p-5 dark:border-violet-800/40 dark:bg-violet-950/20">
          <div className="text-2xl mb-2">🎰</div>
          <h3 className="text-base font-bold text-violet-700 dark:text-violet-400 mb-2">The Pattern</h3>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>1. You lose $200 on a bad trade</p>
            <p>2. You&apos;re angry. You need to &quot;make it back&quot;</p>
            <p>3. You take a bigger, riskier trade without your usual analysis</p>
            <p>4. You lose $400. Now you&apos;re down $600.</p>
            <p>5. Repeat until your account is blown up.</p>
          </div>
        </div>
        <InfoCard type="tip" title="The Rule">
          After two consecutive losing trades, <strong>stop trading for the day</strong>. Walk away. Exercise. Come back tomorrow 
          with a fresh mind. Professional traders treat this as a non-negotiable rule.
        </InfoCard>
      </Section>

      <Section title="Building a Trading Plan">
        <Paragraph>
          A trading plan is your rulebook. It removes emotion from the equation by defining what you&apos;ll do <strong>before</strong> the situation arises:
        </Paragraph>

        <div className="rounded-xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">📋 Trading Plan Template</h4>
          <div className="space-y-3">
            {[
              { label: "Max risk per trade", example: "2% of total capital" },
              { label: "Stop-loss rule", example: "Always set before entering" },
              { label: "Position sizing", example: "Never more than 20% in one stock" },
              { label: "Max trades per day", example: "3 trades maximum" },
              { label: "Loss limit", example: "Stop after 2 consecutive losses" },
              { label: "Profit target", example: "Minimum 1:2 risk/reward" },
              { label: "Review schedule", example: "Review all trades every Friday" },
              { label: "Emotional check", example: "Don't trade when angry, excited, or tired" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-2">e.g., {item.example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Mindset: Process Over Outcome">
        <Paragraph>
          The final lesson: <strong>judge yourself by the quality of your process, not the result of individual trades</strong>.
        </Paragraph>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-800/40 dark:bg-red-950/20">
            <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">❌ Bad Process → Lucky Win</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              &quot;I YOLO&apos;d my entire account into a meme stock and it went up 50%!&quot; — This worked once. It won&apos;t work consistently. 
              You got lucky.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">✅ Good Process → Unlucky Loss</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              &quot;I researched the stock, set a stop-loss, and sized my position properly. It went down and I lost 1.5%.&quot; — 
              This is a <strong>good trade</strong>. Repeat this process 100 times and you&apos;ll be profitable.
            </p>
          </div>
        </div>

        <InfoCard type="key" title="The Bottom Line">
          Trading is a marathon, not a sprint. The traders who survive and thrive are the ones who manage their psychology, 
          follow their plan, and treat every loss as tuition. You&apos;re already ahead of most people just by learning this.
        </InfoCard>
      </Section>
    </LessonLayout>
  );
}
