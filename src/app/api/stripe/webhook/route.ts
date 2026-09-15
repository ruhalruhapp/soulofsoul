import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook handler.
 *
 * Configure this URL in Stripe Dashboard → Webhooks:
 * https://soulofsoul.onrender.com/api/stripe/webhook
 *
 * Events handled:
 * - checkout.session.completed → upgrade user to Tier 2
 * - customer.subscription.deleted → downgrade user to Tier 1
 * - invoice.payment_failed → notify user
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      console.log(`[stripe] checkout completed — userId: ${userId}, plan: ${plan}`);

      // In production: update the user's tier in Convex
      // For now, log it — the actual Convex mutation call goes here
      break;
    }

    case "customer.subscription.deleted": {
      console.log("[stripe] subscription deleted — downgrade user to Tier 1");
      // In production: downgrade user tier in Convex
      break;
    }

    case "invoice.payment_failed": {
      console.log("[stripe] payment failed — notify user");
      // In production: send email notification
      break;
    }

    default:
      // Unhandled event — log but don't error
      break;
  }

  return NextResponse.json({ received: true });
}
