import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

const RETENTION_DAYS = 90;

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    console.log(
      `[Analytics Events Cleanup] Deleting events older than ${cutoff.toISOString()}`
    );

    const result = await db
      .delete(analyticsEvents)
      .where(lt(analyticsEvents.createdAt, cutoff));

    const deletedCount =
      typeof result === "object" && "rowCount" in result
        ? result.rowCount
        : 0;

    console.log(
      `[Analytics Events Cleanup] Deleted ${deletedCount} old analytics events`
    );

    return NextResponse.json({
      ok: true,
      deleted: deletedCount,
      message: `Cleaned up analytics events older than ${RETENTION_DAYS} days`,
    });
  } catch (err) {
    console.error("[Analytics Events Cleanup] Error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
