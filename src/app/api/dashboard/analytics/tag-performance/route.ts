import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resources, analyticsEvents } from "@/lib/db/schema";
import { parseDateRange } from "@/lib/analytics/date-range";
import { isProUser } from "@/lib/subscription";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

  // Query tag click events
  const tagClicks = await db
    .select({
      tag: analyticsEvents.destinationType,
      tagClicks: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventName, "listing.tag_click"),
        sql`${analyticsEvents.listingId} IN (${sql.join(targetIds.map((id) => sql`${id}`), sql`, `)})`,
        gte(analyticsEvents.createdAt, start),
        lte(analyticsEvents.createdAt, end)
      )
    )
    .groupBy(analyticsEvents.destinationType)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(20);

  const formattedData = tagClicks.map((row) => ({
    tag: row.tag || "unknown",
    tagClicks: Number(row.tagClicks) || 0,
  }));

  return NextResponse.json(formattedData);
}
