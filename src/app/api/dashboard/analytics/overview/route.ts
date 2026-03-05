import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resources, analyticsDaily } from "@/lib/db/schema";
import { parseDateRange } from "@/lib/analytics/date-range";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  // Get user's approved listings
  const userListings = await db
    .select({ id: resources.id, category: resources.category })
    .from(resources)
    .where(and(eq(resources.authorId, session.user.id), eq(resources.status, "approved")));

  const userListingIds = userListings.map((l) => l.id);
  if (userListingIds.length === 0) {
    return NextResponse.json({ error: "No listings found" }, { status: 404 });
  }

  // Determine target listing IDs
  const listingId = searchParams.get("listingId");
  let targetIds: string[];
  if (listingId && listingId !== "all") {
    if (!userListingIds.includes(listingId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    targetIds = [listingId];
  } else {
    targetIds = userListingIds;
  }

  // Parse date range
  const range = searchParams.get("range");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const { start, end } = parseDateRange(range, from, to);

  // Calculate previous period for comparison
  const periodLength = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - periodLength);

  // Current period totals
  const currentData = await db
    .select({
      impressions: sql<number>`COALESCE(SUM(${analyticsDaily.impressions}), 0)`,
      detailViews: sql<number>`COALESCE(SUM(${analyticsDaily.detailViews}), 0)`,
      outboundClicks: sql<number>`COALESCE(SUM(${analyticsDaily.outboundClicks}), 0)`,
      uniqueSessions: sql<number>`COALESCE(SUM(${analyticsDaily.uniqueSessions}), 0)`,
    })
    .from(analyticsDaily)
    .where(
      and(
        sql`${analyticsDaily.listingId} IN (${sql.join(targetIds.map((id) => sql`${id}`), sql`, `)})`,
        gte(analyticsDaily.date, start),
        lte(analyticsDaily.date, end)
      )
    );

  // Previous period totals
  const previousData = await db
    .select({
      impressions: sql<number>`COALESCE(SUM(${analyticsDaily.impressions}), 0)`,
      detailViews: sql<number>`COALESCE(SUM(${analyticsDaily.detailViews}), 0)`,
      outboundClicks: sql<number>`COALESCE(SUM(${analyticsDaily.outboundClicks}), 0)`,
      uniqueSessions: sql<number>`COALESCE(SUM(${analyticsDaily.uniqueSessions}), 0)`,
    })
    .from(analyticsDaily)
    .where(
      and(
        sql`${analyticsDaily.listingId} IN (${sql.join(targetIds.map((id) => sql`${id}`), sql`, `)})`,
        gte(analyticsDaily.date, prevStart),
        lte(analyticsDaily.date, prevEnd)
      )
    );

  const current = currentData[0] || { impressions: 0, detailViews: 0, outboundClicks: 0, uniqueSessions: 0 };
  const prev = previousData[0] || { impressions: 0, detailViews: 0, outboundClicks: 0, uniqueSessions: 0 };

  // Calculate rates
  const ctr = current.impressions > 0 ? (current.detailViews / current.impressions) * 100 : 0;
  const outboundRate = current.detailViews > 0 ? (current.outboundClicks / current.detailViews) * 100 : 0;

  return NextResponse.json({
    impressions: current.impressions,
    detailViews: current.detailViews,
    outboundClicks: current.outboundClicks,
    uniqueSessions: current.uniqueSessions,
    ctr: Math.round(ctr * 100) / 100,
    outboundRate: Math.round(outboundRate * 100) / 100,
    prevImpressions: prev.impressions,
    prevDetailViews: prev.detailViews,
    prevOutboundClicks: prev.outboundClicks,
    prevUniqueSessions: prev.uniqueSessions,
  });
}
