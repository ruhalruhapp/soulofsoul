import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Create a Stripe Checkout Session for Tier 2 subscription.
 *
 * POST /api/stripe/checkout
 * Body: { plan: "tier2_monthly" | "tier2_annual", userId: string, email: string }
 * Returns: { url: string } — redirect the user to this URL
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, userId, email } = body;

    if (!plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://soulofsoul.onrender.com";

    // Create a product + price on-the-fly (for demo; in production, pre-create products in Stripe dashboard)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
            unit_amount: planConfig.price,
            recurring: {
              interval: planConfig.interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan,
      },
      success_url: `${appUrl}/?payment=success`,
      cancel_url: `${appUrl}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/stripe/checkout] error:", msg);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
