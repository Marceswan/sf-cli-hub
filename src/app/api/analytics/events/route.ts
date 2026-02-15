import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { z } from "zod";

const eventSchema = z.object({
  eventName: z.enum([
    "listing.impression",
    "listing.detail_view",
    "listing.outbound_click",
    "listing.tag_click",
    "listing.share",
    "listing.bookmark",
  ]),
  listingId: z.string().uuid(),
  sessionId: z.string().min(1).max(64),
  deviceCategory: z.enum(["desktop", "mobile", "tablet"]),
  surface: z.string().max(50).nullish(),
  position: z.number().int().min(0).nullish(),
  destinationType: z.string().max(50).nullish(),
  searchQuery: z.string().max(255).nullish(),
  referrer: z.string().max(1024).nullish(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    // Respect Do Not Track and Global Privacy Control server-side
    const dnt = req.headers.get("dnt");
    const gpc = req.headers.get("sec-gpc");
    if (dnt === "1" || gpc === "1") {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const body = await req.json();
    const parsed = batchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid event data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rows = parsed.data.events.map((e) => ({
      eventName: e.eventName,
      listingId: e.listingId,
      sessionId: e.sessionId,
      deviceCategory: e.deviceCategory,
      surface: e.surface ?? null,
      position: e.position ?? null,
      destinationType: e.destinationType ?? null,
      searchQuery: e.searchQuery ?? null,
      referrer: e.referrer ?? null,
    }));

    await db.insert(analyticsEvents).values(rows);

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error("Analytics events error:", err);
    return NextResponse.json(
      { error: "Failed to record events" },
      { status: 500 }
    );
  }
}
