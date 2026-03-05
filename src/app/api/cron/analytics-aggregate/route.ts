import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  analyticsEvents,
  analyticsDaily,
  analyticsSearchQueries,
  resources,
} from "@/lib/db/schema";
import { sql, eq, and, gte, lte, lt, desc, count, countDistinct } from "drizzle-orm";

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Determine yesterday's date range (UTC)
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setUTCHours(23, 59, 59, 999);

    console.log(
      `[Analytics Aggregate] Processing data for ${yesterday.toISOString().split("T")[0]}`
    );

    // Get all unique listing IDs from yesterday's events
    const listingsWithEvents = await db
      .selectDistinct({ listingId: analyticsEvents.listingId })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, yesterday),
          lte(analyticsEvents.createdAt, yesterdayEnd)
        )
      );

    console.log(
      `[Analytics Aggregate] Found ${listingsWithEvents.length} listings with events`
    );

    let aggregatedCount = 0;

    // Process each listing
    for (const { listingId } of listingsWithEvents) {
      // Get all events for this listing on yesterday
      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.listingId, listingId),
            gte(analyticsEvents.createdAt, yesterday),
            lte(analyticsEvents.createdAt, yesterdayEnd)
          )
        );

      // Count events by type
      const impressions = events.filter(
        (e) => e.eventName === "listing.impression"
      ).length;
      const detailViews = events.filter(
        (e) => e.eventName === "listing.detail_view"
      ).length;
      const outboundClicks = events.filter(
        (e) => e.eventName === "listing.outbound_click"
      ).length;
      const tagClicks = events.filter(
        (e) => e.eventName === "listing.tag_click"
      ).length;
      const shares = events.filter((e) => e.eventName === "listing.share").length;
      const bookmarks = events.filter(
        (e) => e.eventName === "listing.bookmark"
      ).length;

      // Count unique sessions
      const uniqueSessionIds = new Set(events.map((e) => e.sessionId));
      const uniqueSessions = uniqueSessionIds.size;

      // Build referral breakdown (domain -> count)
      const referralMap: Record<string, number> = {};
      events.forEach((e) => {
        if (e.referrer) {
          try {
            const url = new URL(e.referrer);
            const domain = url.hostname;
            referralMap[domain] = (referralMap[domain] || 0) + 1;
          } catch {
            // Invalid URL, use raw referrer
            referralMap[e.referrer] = (referralMap[e.referrer] || 0) + 1;
          }
        }
      });
      const referralBreakdown = JSON.stringify(referralMap);

      // Build outbound breakdown (destinationType -> count)
      const outboundMap: Record<string, number> = {};
      events
        .filter((e) => e.eventName === "listing.outbound_click" && e.destinationType)
        .forEach((e) => {
          const destType = e.destinationType!;
          outboundMap[destType] = (outboundMap[destType] || 0) + 1;
        });
      const outboundBreakdown = JSON.stringify(outboundMap);

      // Upsert into analyticsDaily
      await db
        .insert(analyticsDaily)
        .values({
          listingId,
          date: yesterday,
          impressions,
          detailViews,
          outboundClicks,
          tagClicks,
          shares,
          bookmarks,
          uniqueSessions,
          referralBreakdown,
          outboundBreakdown,
        })
        .onConflictDoUpdate({
          target: [analyticsDaily.listingId, analyticsDaily.date],
          set: {
            impressions: sql`excluded.impressions`,
            detailViews: sql`excluded.detail_views`,
            outboundClicks: sql`excluded.outbound_clicks`,
            tagClicks: sql`excluded.tag_clicks`,
            shares: sql`excluded.shares`,
            bookmarks: sql`excluded.bookmarks`,
            uniqueSessions: sql`excluded.unique_sessions`,
            referralBreakdown: sql`excluded.referral_breakdown`,
            outboundBreakdown: sql`excluded.outbound_breakdown`,
          },
        });

      aggregatedCount++;
    }

    // Aggregate search queries
    const searchEvents = await db
      .select()
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, yesterday),
          lte(analyticsEvents.createdAt, yesterdayEnd),
          sql`${analyticsEvents.searchQuery} IS NOT NULL`
        )
      );

    // Group by listing + query
    const queryMap = new Map<string, { listingId: string; query: string; count: number }>();
    searchEvents.forEach((e) => {
      if (!e.searchQuery) return;
      const key = `${e.listingId}:${e.searchQuery}`;
      const existing = queryMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        queryMap.set(key, {
          listingId: e.listingId,
          query: e.searchQuery,
          count: 1,
        });
      }
    });

    // Upsert search queries
    for (const { listingId, query, count: queryCount } of queryMap.values()) {
      await db
        .insert(analyticsSearchQueries)
        .values({
          listingId,
          date: yesterday,
          query,
          count: queryCount,
        })
        .onConflictDoUpdate({
          target: [
            analyticsSearchQueries.listingId,
            analyticsSearchQueries.date,
            analyticsSearchQueries.query,
          ],
          set: {
            count: sql`excluded.count`,
          },
        });
    }

    console.log(
      `[Analytics Aggregate] Aggregated ${queryMap.size} search queries`
    );

    // Calculate category ranks based on last 30 days impressions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    // Get all listings with their categories
    const allResources = await db
      .select({
        id: resources.id,
        category: resources.category,
      })
      .from(resources);

    // Group by category
    const categoriesMap = new Map<string, string[]>();
    allResources.forEach((r) => {
      const categoryListings = categoriesMap.get(r.category) || [];
      categoryListings.push(r.id);
      categoriesMap.set(r.category, categoryListings);
    });

    // For each category, calculate ranks
    for (const [category, listingIds] of categoriesMap.entries()) {
      // Get total impressions in last 30 days for each listing
      const impressionTotals = await Promise.all(
        listingIds.map(async (listingId) => {
          const result = await db
            .select({
              total: sql<number>`COALESCE(SUM(${analyticsDaily.impressions}), 0)`,
            })
            .from(analyticsDaily)
            .where(
              and(
                eq(analyticsDaily.listingId, listingId),
                gte(analyticsDaily.date, thirtyDaysAgo)
              )
            );
          return {
            listingId,
            total: Number(result[0]?.total || 0),
          };
        })
      );

      // Sort by total impressions descending
      impressionTotals.sort((a, b) => b.total - a.total);

      // Update category rank for yesterday's rows
      for (let i = 0; i < impressionTotals.length; i++) {
        const { listingId } = impressionTotals[i];
        const rank = i + 1;

        await db
          .update(analyticsDaily)
          .set({ categoryRank: rank })
          .where(
            and(
              eq(analyticsDaily.listingId, listingId),
              eq(analyticsDaily.date, yesterday)
            )
          );
      }

      console.log(
        `[Analytics Aggregate] Updated category ranks for ${category}: ${impressionTotals.length} listings`
      );
    }

    return NextResponse.json({
      ok: true,
      aggregated: aggregatedCount,
      date: yesterday.toISOString().split("T")[0],
      searchQueries: queryMap.size,
    });
  } catch (err) {
    console.error("[Analytics Aggregate] Error:", err);
    return NextResponse.json(
      { error: "Aggregation failed" },
      { status: 500 }
    );
  }
}
