import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resources, analyticsDaily } from "@/lib/db/schema";
import { parseDateRange } from "@/lib/analytics/date-range";
import { isProUser } from "@/lib/subscription";
import { eq, and, gte, lte, sql } from "drizzle-orm";
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

  // Get daily rows with outbound breakdown
  const rows = await db
    .select({
      outboundBreakdown: analyticsDaily.outboundBreakdown,
    })
    .from(analyticsDaily)
    .where(
      and(
        sql`${analyticsDaily.listingId} IN (${sql.join(targetIds.map((id) => sql`${id}`), sql`, `)})`,
        gte(analyticsDaily.date, start),
        lte(analyticsDaily.date, end)
      )
    );

  // Merge all outbound breakdowns
  const merged: Record<string, number> = {};
  for (const row of rows) {
    if (row.outboundBreakdown) {
      try {
        const breakdown = JSON.parse(row.outboundBreakdown) as Record<string, number>;
        for (const [destination, count] of Object.entries(breakdown)) {
          merged[destination] = (merged[destination] || 0) + count;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  // Convert to array and sort by count desc
  const result = Object.entries(merged)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json(result);
}
