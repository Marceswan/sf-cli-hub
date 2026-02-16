import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resources, analyticsSearchQueries } from "@/lib/db/schema";
import { parseDateRange } from "@/lib/analytics/date-range";
import { isProUser } from "@/lib/subscription";
import { isFeatureEnabled } from "@/lib/settings";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
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

  // Query search queries
  const queries = await db
    .select({
      query: analyticsSearchQueries.query,
      count: sql<number>`SUM(${analyticsSearchQueries.count})`,
    })
    .from(analyticsSearchQueries)
    .where(
      and(
        sql`${analyticsSearchQueries.listingId} IN (${sql.join(targetIds.map((id) => sql`${id}`), sql`, `)})`,
        gte(analyticsSearchQueries.date, start),
        lte(analyticsSearchQueries.date, end)
      )
    )
    .groupBy(analyticsSearchQueries.query)
    .orderBy(desc(sql`SUM(${analyticsSearchQueries.count})`))
    .limit(20);

  const formattedData = queries.map((row) => ({
    query: row.query,
    count: Number(row.count) || 0,
  }));

  return NextResponse.json(formattedData);
}
