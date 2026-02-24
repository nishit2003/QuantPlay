/**
 * Send an email notification when a price alert is triggered.
 * Requires RESEND_API_KEY.
 */
export async function sendAlertEmail(
  to: string,
  tickerSymbol: string,
  targetPrice: number,
  direction: "above" | "below"
): Promise<{ ok: boolean; error?: string }> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "QuantPlay <noreply@quantplay.org>";

  const conditionText = direction === "above" ? "risen above" : "dropped below";

  const html = `
    <h2>Price Alert Triggered: ${tickerSymbol}</h2>
    <p>Heads up! Your price alert for <strong>${tickerSymbol}</strong> has just been triggered.</p>
    <p>The price has ${conditionText} your target of <strong>$${targetPrice.toFixed(2)}</strong>.</p>
    <br/>
    <p>Check your portfolio and trade now on QuantPlay.</p>
    <p style="color: #666; font-size: 12px; margin-top: 24px;">— QuantPlay</p>
  `.trim();

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Price Alert: ${tickerSymbol} hit your target!`,
    html,
  });

  if (error) {
    console.error("Resend API Error:", error);
    return { ok: false, error: error.message };
  }
  console.log(`Successfully sent email to ${to} for ${tickerSymbol}`);
  return { ok: true };
}
