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

    const dateFilter = and(
      gte(pageViews.viewedAt, start),
      lte(pageViews.viewedAt, end)
    );

    // Daily breakdown of auth vs anonymous
    const daily = await db
      .select({
        date: sql<string>`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`,
        authenticated: sql<number>`count(*) filter (where ${pageViews.userId} is not null)::int`,
        anonymous: sql<number>`count(*) filter (where ${pageViews.userId} is null)::int`,
      })
      .from(pageViews)
      .where(dateFilter)
      .groupBy(sql`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`);

    // Overall totals for pie chart
    const [totals] = await db
      .select({
        authenticated: sql<number>`count(*) filter (where ${pageViews.userId} is not null)::int`,
        anonymous: sql<number>`count(*) filter (where ${pageViews.userId} is null)::int`,
      })
      .from(pageViews)
      .where(dateFilter);

    return NextResponse.json({ daily, totals });
  } catch (err) {
    console.error("Pulse audience error:", err);
    return NextResponse.json({ error: "Failed to fetch audience" }, { status: 500 });
  }
}
