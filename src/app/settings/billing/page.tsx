import { getCurrentUser } from "@/lib/auth-utils";
import { getUserSubscription } from "@/lib/subscription";
import { BillingContent } from "@/components/settings/billing-content";
import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/settings";

export default async function BillingPage() {
  if (!(await isFeatureEnabled("pro"))) {
    redirect("/");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getUserSubscription(user.id);

  return (
    <BillingContent
      subscription={subscription}
      userName={user.name ?? "User"}
      userEmail={user.email ?? ""}
    />
  );
}
