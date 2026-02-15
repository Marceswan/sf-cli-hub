import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { isProUser } from "@/lib/subscription";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export const metadata = { title: "Analytics | SFDXHub" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [isPro, listings] = await Promise.all([
    isProUser(session.user.id),
    db
      .select({
        id: resources.id,
        name: resources.name,
        slug: resources.slug,
        category: resources.category,
        iconEmoji: resources.iconEmoji,
      })
      .from(resources)
      .where(
        and(eq(resources.authorId, session.user.id), eq(resources.status, "approved"))
      ),
  ]);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 pt-[100px]">
      <AnalyticsDashboard listings={listings} isPro={isPro} />
    </main>
  );
}
