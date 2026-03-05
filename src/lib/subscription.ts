import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
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
  const subscription = await getUserSubscription(userId);

  if (!subscription) return false;

  const isValidStatus = subscription.status === "active" || subscription.status === "trialing";
  const isValidPlan = subscription.plan === "pro_monthly" || subscription.plan === "pro_annual";

  return isValidStatus && isValidPlan;
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
