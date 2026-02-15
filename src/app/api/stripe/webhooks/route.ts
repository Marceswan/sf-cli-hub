import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerId || !subscriptionId) {
          console.error("Missing customer or subscription ID in checkout session");
          break;
        }

        // Retrieve the subscription to get plan details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        // Determine plan from price ID
        let plan: "pro_monthly" | "pro_annual" = "pro_monthly";
        if (priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) {
          plan = "pro_annual";
        }

        // Map Stripe subscription status to our enum
        const status = mapStripeStatus(subscription.status);

        // Find subscription by customer ID
        const [existingSub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (existingSub) {
          // Update existing subscription
          await db
            .update(subscriptions)
            .set({
              stripeSubscriptionId: subscriptionId,
              plan,
              status,
              trialStart: subscription.trial_start
                ? new Date(subscription.trial_start * 1000)
                : null,
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
              currentPeriodStart: new Date(subscription.start_date * 1000),
              currentPeriodEnd: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000)
                : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }

        console.log(`Checkout completed for customer ${customerId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        // Determine plan from price ID
        let plan: "pro_monthly" | "pro_annual" = "pro_monthly";
        if (priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) {
          plan = "pro_annual";
        }

        const status = mapStripeStatus(subscription.status);

        // Find subscription by customer ID
        const [existingSub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              plan,
              status,
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
              currentPeriodStart: new Date(subscription.start_date * 1000),
              currentPeriodEnd: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000)
                : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));

          console.log(`Subscription updated for customer ${customerId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find subscription by customer ID
        const [existingSub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              status: "canceled",
              plan: "free",
              stripeSubscriptionId: null,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));

          console.log(`Subscription canceled for customer ${customerId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find subscription by customer ID
        const [existingSub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));

          console.log(`Payment failed for customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "active" | "trialing" | "past_due" | "canceled" | "unpaid" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return "canceled";
    case "incomplete":
    case "unpaid":
      return "unpaid";
    default:
      return "canceled";
  }
}
