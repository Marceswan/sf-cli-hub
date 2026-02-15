import { db } from "@/lib/db";
import { digestPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Find preference by token
  const [preference] = await db
    .select()
    .from(digestPreferences)
    .where(eq(digestPreferences.unsubscribeToken, token))
    .limit(1);

  if (!preference) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  // Disable digest
  await db
    .update(digestPreferences)
    .set({
      enabled: false,
      updatedAt: new Date(),
    })
    .where(eq(digestPreferences.unsubscribeToken, token));

  // Redirect to dashboard with unsubscribe confirmation
  return NextResponse.redirect(
    new URL("/dashboard/analytics?unsubscribed=true", req.url)
  );
}
