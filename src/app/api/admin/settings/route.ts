import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

const DEFAULT_HERO_WORDS = "Architect,Admin,Developer,Superuser,DevOps,Consultant,Agentforce";

async function getSettings() {
  const [row] = await db.select().from(siteSettings).limit(1);
  if (row) return row;

  // Seed default row on first access
  const [created] = await db
    .insert(siteSettings)
    .values({
      id: 1,
      requireApproval: true,
      heroWords: DEFAULT_HERO_WORDS,
      emailWelcome: true,
      emailSubmissionReceived: true,
      emailSubmissionApproved: true,
      emailSubmissionRejected: true,
      emailAdminAlert: true,
      emailUserSuspended: true,
      emailUserBanned: true,
      emailUserRestored: true,
    })
    .onConflictDoNothing()
    .returning();
  return created ?? {
    id: 1,
    requireApproval: true,
    heroWords: DEFAULT_HERO_WORDS,
    emailWelcome: true,
    emailSubmissionReceived: true,
    emailSubmissionApproved: true,
    emailSubmissionRejected: true,
    emailAdminAlert: true,
    emailUserSuspended: true,
    emailUserBanned: true,
    emailUserRestored: true,
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Ensure the row exists
    await getSettings();

    const updateData: Record<string, unknown> = {};
    if (typeof body.requireApproval === "boolean") {
      updateData.requireApproval = body.requireApproval;
    }
    if (typeof body.heroWords === "string") {
      updateData.heroWords = body.heroWords;
    }
    if (typeof body.emailWelcome === "boolean") {
      updateData.emailWelcome = body.emailWelcome;
    }
    if (typeof body.emailSubmissionReceived === "boolean") {
      updateData.emailSubmissionReceived = body.emailSubmissionReceived;
    }
    if (typeof body.emailSubmissionApproved === "boolean") {
      updateData.emailSubmissionApproved = body.emailSubmissionApproved;
    }
    if (typeof body.emailSubmissionRejected === "boolean") {
      updateData.emailSubmissionRejected = body.emailSubmissionRejected;
    }
    if (typeof body.emailAdminAlert === "boolean") {
      updateData.emailAdminAlert = body.emailAdminAlert;
    }
    if (typeof body.emailUserSuspended === "boolean") {
      updateData.emailUserSuspended = body.emailUserSuspended;
    }
    if (typeof body.emailUserBanned === "boolean") {
      updateData.emailUserBanned = body.emailUserBanned;
    }
    if (typeof body.emailUserRestored === "boolean") {
      updateData.emailUserRestored = body.emailUserRestored;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(siteSettings)
      .set(updateData)
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
