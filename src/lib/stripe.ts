/**
 * Stripe configuration for soulofsoul.
 *
 * Set these env vars on Render:
 *   STRIPE_SECRET_KEY      — sk_test_... or sk_live_...
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — pk_test_... or pk_live_...
 *   STRIPE_WEBHOOK_SECRET   — whsec_... (for webhook verification)
 *   NEXT_PUBLIC_APP_URL     — https://soulofsoul.onrender.com
 */

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-12-18.acacia",
});

export const STRIPE_PLANS = {
  tier2_monthly: {
    name: "AI Pro Companion — Monthly",
    description: "Unlimited AI chat, long-term memory, voice agent mode, mood analytics",
    price: 1999, // $19.99 in cents
    interval: "month" as const,
  },
  tier2_annual: {
    name: "AI Pro Companion — Annual",
    description: "Unlimited AI chat, long-term memory, voice agent mode, mood analytics (2 months free)",
    price: 19990, // $199.90 in cents
    interval: "year" as const,
  },
};
