"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Subscription } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface BillingContentProps {
  subscription: Subscription | null;
  userName: string;
  userEmail: string;
}

function BillingContentInner({
  subscription,
  userName,
  userEmail,
}: BillingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle success/cancel feedback from URL params
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({
        type: "success",
        text: "Subscription started successfully! Your trial period has begun.",
      });
      // Clean up URL
      router.replace("/settings/billing");
    } else if (searchParams.get("canceled") === "true") {
      setMessage({
        type: "error",
        text: "Checkout was canceled. No charges were made.",
      });
      // Clean up URL
      router.replace("/settings/billing");
    }
  }, [searchParams, router]);

  const isProPlan =
    subscription?.plan === "pro_monthly" || subscription?.plan === "pro_annual";
  const isTrialing = subscription?.status === "trialing";

  const handleCheckout = async (plan: "pro_monthly" | "pro_annual") => {
    setLoading(plan);
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to start checkout",
      });
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create portal session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to open billing portal",
      });
      setLoading(null);
    }
  };

  const getPlanName = () => {
    if (!subscription || subscription.plan === "free") return "Free";
    if (subscription.plan === "pro_monthly") return "Author Pro Monthly";
    if (subscription.plan === "pro_annual") return "Author Pro Annual";
    return "Unknown";
  };

  const getPlanBadgeVariant = () => {
    if (isProPlan) return "primary";
    return "default";
  };

  const getPlanPrice = () => {
    if (!subscription || subscription.plan === "free") return "$0/month";
    if (subscription.plan === "pro_monthly") return "$9/month";
    if (subscription.plan === "pro_annual") return "$79/year (~$6.58/mo)";
    return "Unknown";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">
          Billing & Subscription
        </h1>
        <p className="text-text-muted">
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Feedback Messages */}
      {message && (
        <div
          className={`rounded-card border px-4 py-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-bg-card border border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-main">Current Plan</h2>
          <Badge variant={getPlanBadgeVariant()}>{getPlanName()}</Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Price</span>
            <span className="text-text-main font-medium">{getPlanPrice()}</span>
          </div>

          {subscription && isProPlan && (
            <>
              {isTrialing && subscription.trialEnd && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Trial Ends</span>
                  <span className="text-amber-500 font-medium">
                    {formatDate(subscription.trialEnd)}
                  </span>
                </div>
              )}

              {!isTrialing && subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Next Billing Date</span>
                  <span className="text-text-main font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Cancels On</span>
                  <span className="text-red-500 font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="text-text-main font-medium capitalize">
                  {subscription.status.replace("_", " ")}
                </span>
              </div>
            </>
          )}
        </div>

        {isProPlan && (
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={handlePortal}
              disabled={loading !== null}
              className="w-full"
            >
              {loading === "portal" ? "Loading..." : "Manage Subscription"}
            </Button>
          </div>
        )}
      </div>

      {/* Pricing Cards - Only show if on free plan */}
      {!isProPlan && (
        <div>
          <h2 className="text-xl font-semibold text-text-main mb-4">
            Upgrade to Pro
          </h2>
          <p className="text-text-muted mb-6">
            Get access to advanced analytics and insights for your submissions.
            Start with a 14-day free trial.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div className="bg-bg-card border border-border rounded-card p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-main mb-2">
                  Author Pro Monthly
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-main">$9</span>
                  <span className="text-text-muted">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-grow text-sm text-text-muted">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Detailed engagement metrics
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Export data as CSV
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Priority support
                </li>
              </ul>

              <Button
                onClick={() => handleCheckout("pro_monthly")}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "pro_monthly"
                  ? "Loading..."
                  : "Start 14-day Free Trial"}
              </Button>
            </div>

            {/* Annual Plan */}
            <div className="bg-bg-card border-2 border-primary rounded-card p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary">Best Value</Badge>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-main mb-2">
                  Author Pro Annual
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-main">$79</span>
                  <span className="text-text-muted">/year</span>
                </div>
                <p className="text-sm text-primary mt-1">~$6.58/mo · Save 27%</p>
              </div>

              <ul className="space-y-2 mb-6 flex-grow text-sm text-text-muted">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Detailed engagement metrics
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Export data as CSV
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Priority support
                </li>
              </ul>

              <Button
                onClick={() => handleCheckout("pro_annual")}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "pro_annual"
                  ? "Loading..."
                  : "Start 14-day Free Trial"}
              </Button>
            </div>
          </div>

          <p className="text-xs text-text-muted text-center mt-4">
            Your card won't be charged until the trial ends. Cancel anytime.
          </p>
        </div>
      )}
    </div>
  );
}

export function BillingContent(props: BillingContentProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-text-main mb-2">
              Billing & Subscription
            </h1>
            <p className="text-text-muted">Loading...</p>
          </div>
        </div>
      }
    >
      <BillingContentInner {...props} />
    </Suspense>
  );
}
