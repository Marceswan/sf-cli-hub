import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources, users, reviews } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalUsers] = await db
      .select({ count: count() })
      .from(users);

    const [totalResources] = await db
      .select({ count: count() })
      .from(resources);

    const [pendingResources] = await db
      .select({ count: count() })
      .from(resources)
      .where(eq(resources.status, "pending"));

    const [approvedResources] = await db
      .select({ count: count() })
      .from(resources)
      .where(eq(resources.status, "approved"));

    const [totalReviews] = await db
      .select({ count: count() })
      .from(reviews);

    const categoryBreakdown = await db
      .select({
        category: resources.category,
        count: count(),
      })
      .from(resources)
      .where(eq(resources.status, "approved"))
      .groupBy(resources.category);

    const recentSubmissions = await db
      .select({
        id: resources.id,
        name: resources.name,
        category: resources.category,
        status: resources.status,
        createdAt: resources.createdAt,
        authorName: users.name,
      })
      .from(resources)
      .leftJoin(users, eq(resources.authorId, users.id))
      .orderBy(sql`${resources.createdAt} desc`)
      .limit(5);

    return NextResponse.json({
      totalUsers: Number(totalUsers.count),
      totalResources: Number(totalResources.count),
      pendingResources: Number(pendingResources.count),
      approvedResources: Number(approvedResources.count),
      totalReviews: Number(totalReviews.count),
      categoryBreakdown,
      recentSubmissions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
