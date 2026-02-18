import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PACKAGES: Record<string, { realAmount: number; virtualCash: number; label: string }> = {
  A: { realAmount: 200, virtualCash: 100, label: "$100 Virtual Cash" },
  B: { realAmount: 800, virtualCash: 500, label: "$500 Virtual Cash" },
  C: { realAmount: 2000, virtualCash: 1500, label: "$1,500 Virtual Cash" },
};

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const pkg = PACKAGES[body.package];

  if (!pkg) {
    return NextResponse.json({ error: "Invalid package. Use A or B." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `QuantPlay ${pkg.label}` },
            unit_amount: pkg.realAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        virtualCash: pkg.virtualCash.toString(),
        packageId: body.package,
      },
      success_url: `${origin}/recharge?success=true`,
      cancel_url: `${origin}/recharge?cancelled=true`,
    });

    await prisma.orderPurchase.create({
      data: {
        userId: session.user.id,
        stripeSessionId: checkoutSession.id,
        realAmountPaid: pkg.realAmount / 100,
        virtualCashAdded: pkg.virtualCash,
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
