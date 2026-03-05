import { getCurrentUser } from "@/lib/auth-utils";
import { getOrCreateStripeCustomer } from "@/lib/subscription";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isFeatureEnabled } from "@/lib/settings";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com";

const checkoutSchema = z.object({
  plan: z.enum(["pro_monthly", "pro_annual"]),
});

export async function POST(req: NextRequest) {
  try {
    if (!(await isFeatureEnabled("pro"))) {
      return NextResponse.json({ error: "This feature is not currently available" }, { status: 404 });
    }

    // Require authentication
    const user = await getCurrentUser();
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const { plan } = checkoutSchema.parse(body);

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email);

    // Map plan to Stripe price ID
    const priceId =
      plan === "pro_monthly"
        ? process.env.STRIPE_PRO_MONTHLY_PRICE_ID
        : process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
        },
      },
      success_url: `${BASE_URL}/settings/billing?success=true`,
      cancel_url: `${BASE_URL}/settings/billing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
