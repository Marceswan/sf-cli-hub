import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { sql, gte, lte, and, isNotNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { parseDateRange } from "@/lib/analytics/date-range";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = req.nextUrl.searchParams;
    const { start, end } = parseDateRange(
      params.get("range"),
      params.get("from"),
      params.get("to")
    );

    const dateFilter = and(
      gte(pageViews.viewedAt, start),
      lte(pageViews.viewedAt, end)
    );

    const [stats] = await db
      .select({
        totalViews: sql<number>`count(*)::int`,
        uniqueVisitors: sql<number>`count(distinct ${pageViews.visitorId})::int`,
        avgDuration: sql<number>`coalesce(round(avg(${pageViews.durationSeconds})), 0)::int`,
        authViews: sql<number>`count(*) filter (where ${pageViews.userId} is not null)::int`,
      })
      .from(pageViews)
      .where(dateFilter);

    const authRatio =
      stats.totalViews > 0
        ? Math.round((stats.authViews / stats.totalViews) * 100)
        : 0;

    return NextResponse.json({
      totalViews: stats.totalViews,
      uniqueVisitors: stats.uniqueVisitors,
      avgDuration: stats.avgDuration,
      authRatio,
    });
  } catch (err) {
    console.error("Pulse overview error:", err);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}
