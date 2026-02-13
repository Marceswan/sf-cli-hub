import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { viewId, duration } = body as {
      viewId: string;
      duration: number;
    };

    if (!viewId || typeof duration !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Cap at 30 minutes to avoid bogus values
    const capped = Math.min(Math.max(Math.round(duration), 0), 1800);

    await db
      .update(pageViews)
      .set({ durationSeconds: capped })
      .where(eq(pageViews.id, viewId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics duration error:", err);
    return NextResponse.json({ error: "Failed to update duration" }, { status: 500 });
  }
}
