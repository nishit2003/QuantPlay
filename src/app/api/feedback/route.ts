import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function sendFeedbackEmail(params: {
  to: string;
  message: string;
  subject: string;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "QuantPlay Feedback <onboarding@resend.dev>";

  const body = `
<p><strong>Subject:</strong> ${params.subject || "(No subject)"}</p>
<p><strong>From:</strong> ${params.userName ?? "Anonymous"} ${params.userEmail ? `&lt;${params.userEmail}&gt;` : ""}</p>
<hr />
<p>${params.message.replace(/\n/g, "<br />")}</p>
<hr />
<p><small>Sent via QuantPlay feedback form</small></p>
`.trim();

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject: `[QuantPlay Feedback] ${params.subject || "Suggestion"}`,
    html: body,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

export async function POST(request: Request) {
  const to = process.env.FEEDBACK_TO_EMAIL;
  if (!to) {
    return NextResponse.json(
      { error: "Feedback is not configured. Set FEEDBACK_TO_EMAIL." },
      { status: 503 }
    );
  }

  let body: { message?: string; subject?: string; name?: string; category?: string; attachment?: { name: string; base64: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Please enter at least 10 characters." },
      { status: 400 }
    );
  }

  const category = body.category || "general";
  const categoryLabel = category === "bug" ? "🐛 Bug Report" : category === "feature" ? "💡 Feature Request" : "💬 General";

  const session = await auth();

  let attachmentHtml = "";
  if (body.attachment?.base64) {
    attachmentHtml = `<hr /><p><strong>Attachment:</strong> ${body.attachment.name}</p><p><img src="data:image/png;base64,${body.attachment.base64}" style="max-width:600px;border-radius:8px;" alt="attachment" /></p>`;
  }

  const result = await sendFeedbackEmail({
    to,
    message: message + attachmentHtml,
    subject: `[${categoryLabel}] ${typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "Suggestion"}`,
    userName: body.name?.trim() || session?.user?.name || null,
    userEmail: session?.user?.email || null,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to send" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: "Thanks! Your feedback was sent." });
}

