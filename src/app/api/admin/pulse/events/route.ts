import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
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
      gte(analyticsEvents.createdAt, start),
      lte(analyticsEvents.createdAt, end)
    );

    // Get event counts grouped by event_name
    const events = await db
      .select({
        eventName: analyticsEvents.eventName,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(dateFilter)
      .groupBy(analyticsEvents.eventName)
      .orderBy(sql`count(*) desc`);

    return NextResponse.json(events);
  } catch (err) {
    console.error("Pulse events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
