/**
 * Send a thank-you / welcome email to new signups after they verify their email.
 * Uses Resend. Requires RESEND_API_KEY. Optional RESEND_FROM_EMAIL.
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<{ ok: boolean; error?: string }> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "QuantPlay <onboarding@resend.dev>";
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const feedbackUrl = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL.replace(/\/$/, "")}/feedback`
    : "https://quantplay.app/feedback";

  const html = `
<p>Hi ${firstName},</p>
<p>Thank you so much for signing up for QuantPlay. We really appreciate you taking the time to join us and try out the platform.</p>
<p>You’re now part of a small group of people who are learning to trade smarter with zero risk — and we’re glad you’re here.</p>
<p><strong>We’re still in our early phases of development.</strong> Things will keep improving, and your experience matters a lot to us. If you have a moment, we’d love to hear from you: please drop a note in our <a href="${feedbackUrl}" style="color: #059669;">Feedback form</a>. We read every message and will look into your suggestions and ideas.</p>
<p>Thanks again for being an early supporter.</p>
<p style="margin-top: 24px;">
  Warm regards,<br/>
  <strong>Nishit Grover</strong><br/>
  Founder, QuantPlay
</p>
`.trim();

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Thanks for joining QuantPlay — we're glad you're here",
    html,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
