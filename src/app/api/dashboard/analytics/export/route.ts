import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resources, analyticsDaily } from "@/lib/db/schema";
import { parseDateRange } from "@/lib/analytics/date-range";
import { isProUser } from "@/lib/subscription";
import { isFeatureEnabled } from "@/lib/settings";
import { eq, and, gte, lte, sql, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (!(await isFeatureEnabled("pro"))) {
    return NextResponse.json({ error: "This feature is not currently available" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pro check
  const isPro = await isProUser(session.user.id);
  if (!isPro) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
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

  // Query analytics daily data
  const dailyData = await db
    .select({
      date: analyticsDaily.date,
      listingId: analyticsDaily.listingId,
      impressions: analyticsDaily.impressions,
      detailViews: analyticsDaily.detailViews,
      outboundClicks: analyticsDaily.outboundClicks,
      uniqueSessions: analyticsDaily.uniqueSessions,
      tagClicks: analyticsDaily.tagClicks,
      shares: analyticsDaily.shares,
      bookmarks: analyticsDaily.bookmarks,
      categoryRank: analyticsDaily.categoryRank,
    })
    .from(analyticsDaily)
    .where(
      and(
        sql`${analyticsDaily.listingId} IN (${sql.join(targetIds.map((id) => sql`${id}`), sql`, `)})`,
        gte(analyticsDaily.date, start),
        lte(analyticsDaily.date, end)
      )
    )
    .orderBy(asc(analyticsDaily.date), asc(analyticsDaily.listingId));

  // Format as CSV
  const headers = [
    "date",
    "listing_id",
    "impressions",
    "detail_views",
    "outbound_clicks",
    "unique_sessions",
    "tag_clicks",
    "shares",
    "bookmarks",
    "category_rank",
  ];

  const rows = dailyData.map((row) => [
    row.date.toISOString().split("T")[0],
    row.listingId,
    row.impressions,
    row.detailViews,
    row.outboundClicks,
    row.uniqueSessions,
    row.tagClicks,
    row.shares,
    row.bookmarks,
    row.categoryRank ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="analytics-export.csv"`,
    },
  });
}
