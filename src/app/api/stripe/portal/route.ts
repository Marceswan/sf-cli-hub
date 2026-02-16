import { getCurrentUser } from "@/lib/auth-utils";
import { getUserSubscription } from "@/lib/subscription";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/settings";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com";

export async function POST(req: NextRequest) {
  try {
    if (!(await isFeatureEnabled("pro"))) {
      return NextResponse.json({ error: "This feature is not currently available" }, { status: 404 });
    }

    // Require authentication
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription to retrieve Stripe customer ID
    const subscription = await getUserSubscription(user.id);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${BASE_URL}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
