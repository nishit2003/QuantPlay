import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const virtualCash = parseFloat(session.metadata?.virtualCash ?? "0");

    if (!userId || virtualCash <= 0) {
      console.error("Invalid webhook metadata:", session.metadata);
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.orderPurchase.update({
          where: { stripeSessionId: session.id },
          data: { status: "COMPLETED" },
        });

        await tx.user.update({
          where: { id: userId },
          data: { virtualCashBalance: { increment: virtualCash } },
        });
      });
    } catch (error) {
      console.error("Failed to process webhook:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
