import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

const RETENTION_DAYS = 180;

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const result = await db
      .delete(pageViews)
      .where(lt(pageViews.viewedAt, cutoff));

    return NextResponse.json({
      ok: true,
      message: `Cleaned up page views older than ${RETENTION_DAYS} days`,
    });
  } catch (err) {
    console.error("Analytics cleanup error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
