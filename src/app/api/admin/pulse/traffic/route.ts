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
    const groupBy = params.get("groupBy") || "day";

    const dateFilter = and(
      gte(pageViews.viewedAt, start),
      lte(pageViews.viewedAt, end)
    );

    if (groupBy === "hour") {
      const rows = await db
        .select({
          hour: sql<number>`extract(hour from ${pageViews.viewedAt})::int`,
          views: sql<number>`count(*)::int`,
          visitors: sql<number>`count(distinct ${pageViews.visitorId})::int`,
        })
        .from(pageViews)
        .where(dateFilter)
        .groupBy(sql`extract(hour from ${pageViews.viewedAt})`)
        .orderBy(sql`extract(hour from ${pageViews.viewedAt})`);

      return NextResponse.json(rows);
    }

    // Default: group by day
    const rows = await db
      .select({
        date: sql<string>`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`,
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${pageViews.visitorId})::int`,
      })
      .from(pageViews)
      .where(dateFilter)
      .groupBy(sql`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Pulse traffic error:", err);
    return NextResponse.json({ error: "Failed to fetch traffic" }, { status: 500 });
  }
}
