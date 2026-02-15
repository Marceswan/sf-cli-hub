import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { digestPreferences, users, resources, analyticsDaily } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { buildDigestContent, type DigestListing } from "@/lib/email-digest";
import { Resend } from "resend";

const FROM = "SFDX Hub <noreply@sfdxhub.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Daily cron job that sends analytics digest emails to users
 * based on their preferences (runs at 08:00 UTC daily)
 */
export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get all users who have digest enabled for today
    const usersToNotify = await db
      .select({
        userId: digestPreferences.userId,
        userEmail: users.email,
        userName: users.name,
        unsubscribeToken: digestPreferences.unsubscribeToken,
      })
      .from(digestPreferences)
      .innerJoin(users, eq(digestPreferences.userId, users.id))
      .where(
        and(
          eq(digestPreferences.enabled, true),
          eq(digestPreferences.dayOfWeek, dayOfWeek)
        )
      );

    const resend = getResend();
    if (!resend) {
      console.warn("[digest] Resend not configured, skipping digest emails");
      return NextResponse.json({ sent: 0, skipped: usersToNotify.length });
    }

    let sent = 0;

    // Calculate date ranges for this week and last week
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(today);
    thisWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    // Process each user
    for (const user of usersToNotify) {
      try {
        // Get all approved listings for this user
        const userListings = await db
          .select({
            id: resources.id,
            name: resources.name,
            slug: resources.slug,
          })
          .from(resources)
          .where(
            and(
              eq(resources.authorId, user.userId),
              eq(resources.status, "approved")
            )
          );

        if (userListings.length === 0) {
          console.log(`[digest] User ${user.userEmail} has no approved listings, skipping`);
          continue;
        }

        // For each listing, get this week's and last week's analytics
        const listingData: DigestListing[] = [];

        for (const listing of userListings) {
          // Get this week's totals
          const [thisWeekStats] = await db
            .select({
              impressions: sql<number>`coalesce(sum(${analyticsDaily.impressions}), 0)::int`,
              detailViews: sql<number>`coalesce(sum(${analyticsDaily.detailViews}), 0)::int`,
              outboundClicks: sql<number>`coalesce(sum(${analyticsDaily.outboundClicks}), 0)::int`,
            })
            .from(analyticsDaily)
            .where(
              and(
                eq(analyticsDaily.listingId, listing.id),
                gte(analyticsDaily.date, thisWeekStart),
                lte(analyticsDaily.date, thisWeekEnd)
              )
            );

          // Get last week's totals
          const [lastWeekStats] = await db
            .select({
              impressions: sql<number>`coalesce(sum(${analyticsDaily.impressions}), 0)::int`,
              detailViews: sql<number>`coalesce(sum(${analyticsDaily.detailViews}), 0)::int`,
              outboundClicks: sql<number>`coalesce(sum(${analyticsDaily.outboundClicks}), 0)::int`,
            })
            .from(analyticsDaily)
            .where(
              and(
                eq(analyticsDaily.listingId, listing.id),
                gte(analyticsDaily.date, lastWeekStart),
                lte(analyticsDaily.date, lastWeekEnd)
              )
            );

          listingData.push({
            name: listing.name,
            slug: listing.slug,
            impressions: thisWeekStats?.impressions || 0,
            detailViews: thisWeekStats?.detailViews || 0,
            outboundClicks: thisWeekStats?.outboundClicks || 0,
            prevImpressions: lastWeekStats?.impressions || 0,
            prevDetailViews: lastWeekStats?.detailViews || 0,
            prevOutboundClicks: lastWeekStats?.outboundClicks || 0,
          });
        }

        // Build unsubscribe URL
        const unsubscribeUrl = `${BASE_URL}/settings/digest?unsubscribe=${user.unsubscribeToken}`;

        // Build email content
        const html = buildDigestContent(
          user.userName || "",
          listingData,
          unsubscribeUrl
        );

        // Send email
        await resend.emails.send({
          from: FROM,
          to: user.userEmail,
          subject: "Your Weekly Analytics Digest",
          html,
        });

        sent++;
        console.log(`[digest] Sent digest to ${user.userEmail}`);
      } catch (err) {
        console.error(`[digest] Failed to send digest to ${user.userEmail}:`, err);
      }
    }

    return NextResponse.json({ sent });
  } catch (err) {
    console.error("[digest] Digest cron error:", err);
    return NextResponse.json({ error: "Digest cron failed" }, { status: 500 });
  }
}
