export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { resources, users, reviews } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { Users, Database, Inbox, Star } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-cards";
import Link from "next/link";
import { RecentSubmissions } from "@/components/admin/recent-submissions";
import { PulseDashboard } from "@/components/admin/pulse/pulse-dashboard";

export default async function AdminDashboard() {
  const [[totalUsers], [totalResources], [pending], [totalReviews]] =
    await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(resources),
      db
        .select({ count: count() })
        .from(resources)
        .where(eq(resources.status, "pending")),
      db.select({ count: count() }).from(reviews),
    ]);

  const recentSubmissions = await db
    .select({
      id: resources.id,
      name: resources.name,
      category: resources.category,
      status: resources.status,
      createdAt: resources.createdAt,
      authorName: sql<string>`COALESCE(${resources.authorName}, ${users.name})`,
    })
    .from(resources)
    .leftJoin(users, eq(resources.authorId, users.id))
    .orderBy(sql`${resources.createdAt} desc`)
    .limit(5);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard
          label="Total Users"
          value={Number(totalUsers.count)}
          icon={<Users size={20} />}
        />
        <StatsCard
          label="Total Resources"
          value={Number(totalResources.count)}
          icon={<Database size={20} />}
        />
        <StatsCard
          label="Pending Review"
          value={Number(pending.count)}
          icon={<Inbox size={20} />}
        />
        <StatsCard
          label="Total Reviews"
          value={Number(totalReviews.count)}
          icon={<Star size={20} />}
        />
      </div>

      <div className="bg-bg-card border border-border rounded-card p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Submissions</h3>
          <Link
            href="/admin/submissions"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentSubmissions
          submissions={recentSubmissions.map((s) => ({
            ...s,
            createdAt: String(s.createdAt),
          }))}
        />
      </div>

      <PulseDashboard />
    </div>
  );
}
