import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { sql, gte, lte, and } from "drizzle-orm";
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
    const limit = Math.min(Number(params.get("limit")) || 20, 100);

    const dateFilter = and(
      gte(pageViews.viewedAt, start),
      lte(pageViews.viewedAt, end)
    );

    const rows = await db
      .select({
        path: pageViews.path,
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${pageViews.visitorId})::int`,
        avgDuration: sql<number>`coalesce(round(avg(${pageViews.durationSeconds})), 0)::int`,
      })
      .from(pageViews)
      .where(dateFilter)
      .groupBy(pageViews.path)
      .orderBy(sql`count(*) desc`)
      .limit(limit);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Pulse pages error:", err);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
