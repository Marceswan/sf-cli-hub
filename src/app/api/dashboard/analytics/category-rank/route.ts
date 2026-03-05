import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resources, analyticsDaily, type Resource } from "@/lib/db/schema";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";
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

  // Get specific listing or default to first
  const listingId = searchParams.get("listingId");
  let targetId: string;
  let targetCategory: Resource["category"];

  if (listingId && listingId !== "all") {
    const listing = userListings.find((l) => l.id === listingId);
    if (!listing) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    targetId = listing.id;
    targetCategory = listing.category;
  } else {
    // Default to first listing
    targetId = userListings[0].id;
    targetCategory = userListings[0].category;
  }

  // Get the latest analytics daily row with a category rank for this listing
  const latestRank = await db
    .select({
      categoryRank: analyticsDaily.categoryRank,
    })
    .from(analyticsDaily)
    .where(and(eq(analyticsDaily.listingId, targetId), isNotNull(analyticsDaily.categoryRank)))
    .orderBy(desc(analyticsDaily.date))
    .limit(1);

  // Count total approved resources in this category
  const totalInCategory = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(resources)
    .where(and(eq(resources.category, targetCategory), eq(resources.status, "approved")));

  const rank = latestRank.length > 0 ? latestRank[0].categoryRank : null;
  const total = Number(totalInCategory[0]?.count) || 0;

  return NextResponse.json({
    rank,
    total,
    category: targetCategory,
  });
}
