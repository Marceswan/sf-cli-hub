import { getCurrentUser } from "@/lib/auth-utils";
import { getUserSubscription, syncSubscriptionFromStripe } from "@/lib/subscription";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let subscription = await getUserSubscription(user.id);

    // If subscription exists with a Stripe customer ID but is still on free plan,
    // sync with Stripe to pick up any webhook-missed updates
    const sync = new URL(req.url).searchParams.get("sync");
    if (
      sync === "true" &&
      subscription?.stripeCustomerId &&
      subscription.plan === "free"
    ) {
      const synced = await syncSubscriptionFromStripe(
        subscription.stripeCustomerId
      );
      if (synced) {
        subscription = synced;
      }
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
