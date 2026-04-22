import { NextResponse } from "next/server";

import { recordPurchase } from "@/lib/purchases-store";
import {
  extractStripeCheckoutEmail,
  type StripeLikeEvent,
  verifyStripeWebhookSignature
} from "@/lib/stripe-webhook";

export const runtime = "nodejs";

const PURCHASE_EVENTS = new Set(["checkout.session.completed", "invoice.paid"]);

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature header." }, { status: 400 });
  }

  const payload = await request.text();
  const isValidSignature = verifyStripeWebhookSignature(payload, signature, webhookSecret);

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeLikeEvent;

  if (PURCHASE_EVENTS.has(event.type)) {
    const email = extractStripeCheckoutEmail(event);

    if (email) {
      const dataObject = event.data.object;
      const checkoutSessionId =
        typeof dataObject.id === "string"
          ? dataObject.id
          : typeof dataObject.subscription === "string"
            ? dataObject.subscription
            : undefined;

      await recordPurchase({
        email,
        purchasedAt: new Date(event.created * 1000).toISOString(),
        source: "stripe",
        eventType: event.type,
        checkoutSessionId,
        amountTotal: typeof dataObject.amount_total === "number" ? dataObject.amount_total : undefined,
        currency: typeof dataObject.currency === "string" ? dataObject.currency : undefined
      });
    }
  }

  return NextResponse.json({ received: true });
}
