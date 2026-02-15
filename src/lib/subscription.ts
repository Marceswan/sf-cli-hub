import { db } from "@/lib/db";
import { subscriptions, users, type Subscription } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function getUserSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return subscription ?? null;
}

export async function isProUser(userId: string): Promise<boolean> {
  const localSub = await getUserSubscription(userId);

  if (!localSub) return false;

  // If the local record is still "free" but has a Stripe customer,
  // sync with Stripe in case the webhook hasn't fired yet
  let subscription = localSub;
  if (localSub.plan === "free" && localSub.stripeCustomerId) {
    const synced = await syncSubscriptionFromStripe(localSub.stripeCustomerId);
    if (synced) {
      subscription = synced;
    }
  }

  const isValidStatus = subscription.status === "active" || subscription.status === "trialing";
  const isValidPlan = subscription.plan === "pro_monthly" || subscription.plan === "pro_annual";

  return isValidStatus && isValidPlan;
}

/**
 * Sync the local subscription record with Stripe's actual state.
 * Used as a fallback when webhooks haven't fired yet.
 */
export async function syncSubscriptionFromStripe(
  stripeCustomerId: string
): Promise<Subscription | null> {
  try {
    // List active subscriptions for this customer
    const stripeSubs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 1,
    });

    const stripeSub = stripeSubs.data[0];
    if (!stripeSub) {
      // No subscription on Stripe side — return current local record
      const [local] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
        .limit(1);
      return local ?? null;
    }

    const priceId = stripeSub.items.data[0]?.price.id;
    let plan: "free" | "pro_monthly" | "pro_annual" = "pro_monthly";
    if (priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) {
      plan = "pro_annual";
    }

    const statusMap: Record<string, Subscription["status"]> = {
      active: "active",
      trialing: "trialing",
      past_due: "past_due",
      canceled: "canceled",
      incomplete_expired: "canceled",
      paused: "canceled",
      incomplete: "unpaid",
      unpaid: "unpaid",
    };

    const status = statusMap[stripeSub.status] ?? "canceled";

    // Update local record
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: stripeSub.id,
        plan,
        status,
        trialStart: stripeSub.trial_start
          ? new Date(stripeSub.trial_start * 1000)
          : null,
        trialEnd: stripeSub.trial_end
          ? new Date(stripeSub.trial_end * 1000)
          : null,
        currentPeriodStart: new Date(stripeSub.start_date * 1000),
        currentPeriodEnd: stripeSub.cancel_at
          ? new Date(stripeSub.cancel_at * 1000)
          : null,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeCustomerId, stripeCustomerId));

    // Return updated record
    const [updated] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1);

    return updated ?? null;
  } catch (error) {
    console.error("Failed to sync subscription from Stripe:", error);
    // Return current local record on error
    const [local] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1);
    return local ?? null;
  }
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Check if user already has a subscription record with Stripe customer ID
  const existing = await getUserSubscription(userId);

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Insert or update subscription record
  if (existing) {
    // Update existing record with Stripe customer ID
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId: customer.id,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    // Create new subscription record with free plan
    await db.insert(subscriptions).values({
      userId,
      stripeCustomerId: customer.id,
      plan: "free",
      status: "active",
    });
  }

  return customer.id;
}
