import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/market";
import { sendAlertEmail } from "@/lib/send-alert-email";

export async function checkPriceAlerts() {
  const alerts = await prisma.priceAlert.findMany({
    where: { triggered: false },
    include: { user: { select: { email: true } } }
  });
  if (alerts.length === 0) return;

  const tickers = [...new Set(alerts.map((a) => a.tickerSymbol))];
  const priceMap: Record<string, number> = {};
  for (const t of tickers) {
    const q = await getQuote(t);
    if (q) priceMap[t] = q.regularMarketPrice;
  }

  for (const alert of alerts) {
    const price = priceMap[alert.tickerSymbol];
    if (price == null) continue;
    const target = Number(alert.targetPrice);
    const hit =
      alert.direction === "above" ? price >= target : price <= target;
    if (hit) {
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { triggered: true },
      });
      
      // Send the email notification asynchronously
      if (alert.user.email) {
        sendAlertEmail(
          alert.user.email,
          alert.tickerSymbol,
          target,
          alert.direction as "above" | "below"
        ).catch((err: unknown) => console.error("Failed to send alert email", err));
      }
    }
  }
}
