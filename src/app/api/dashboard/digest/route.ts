import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { digestPreferences } from "@/lib/db/schema";
import { isProUser } from "@/lib/subscription";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's digest preferences
  const [preferences] = await db
    .select({
      enabled: digestPreferences.enabled,
      dayOfWeek: digestPreferences.dayOfWeek,
    })
    .from(digestPreferences)
    .where(eq(digestPreferences.userId, session.user.id))
    .limit(1);

  if (!preferences) {
    return NextResponse.json({
      enabled: false,
      dayOfWeek: 1,
    });
  }

  return NextResponse.json({
    enabled: preferences.enabled,
    dayOfWeek: preferences.dayOfWeek,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { enabled, dayOfWeek } = body;

  // Pro check for enabling
  if (enabled) {
    const isPro = await isProUser(session.user.id);
    if (!isPro) {
      return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
    }
  }

  // Check if preferences exist
  const [existing] = await db
    .select()
    .from(digestPreferences)
    .where(eq(digestPreferences.userId, session.user.id))
    .limit(1);

  if (existing) {
    // Update existing preferences
    await db
      .update(digestPreferences)
      .set({
        enabled,
        dayOfWeek,
        updatedAt: new Date(),
      })
      .where(eq(digestPreferences.userId, session.user.id));
  } else {
    // Create new preferences with unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");
    await db.insert(digestPreferences).values({
      userId: session.user.id,
      enabled,
      dayOfWeek,
      unsubscribeToken,
    });
  }

  return NextResponse.json({ success: true });
}
