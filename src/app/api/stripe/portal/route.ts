import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Create a Stripe Billing Portal session (for managing existing subscriptions).
 *
 * POST /api/stripe/portal
 * Body: { customerId: string }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://soulofsoul.onrender.com";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/stripe/portal] error:", msg);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
