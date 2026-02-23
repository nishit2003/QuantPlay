/**
 * Send OTP email for sign-up verification via Resend.
 * Requires RESEND_API_KEY. Optional RESEND_FROM_EMAIL.
 */
export async function sendSignUpOtpEmail(to: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "QuantPlay <onboarding@resend.dev>";

  const html = `
<p>Your QuantPlay verification code is:</p>
<p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
<p style="color: #666; font-size: 14px;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
<p style="color: #666; font-size: 12px; margin-top: 24px;">— QuantPlay</p>
`.trim();

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Your QuantPlay verification code",
    html,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
