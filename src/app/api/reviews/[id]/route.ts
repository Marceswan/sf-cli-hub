import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, resources } from "@/lib/db/schema";
import { eq, avg, count } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function updateResourceRating(resourceId: string) {
  const [stats] = await db
    .select({
      avgRating: avg(reviews.rating),
      reviewsCount: count(),
    })
    .from(reviews)
    .where(eq(reviews.resourceId, resourceId));

  await db
    .update(resources)
    .set({
      avgRating: stats.avgRating || "0",
      reviewsCount: Number(stats.reviewsCount) || 0,
      updatedAt: new Date(),
    })
    .where(eq(resources.id, resourceId));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.rating) updateData.rating = body.rating;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.body !== undefined) updateData.body = body.body;

    const [updated] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();

    await updateResourceRating(existing.resourceId);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = existing.userId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(reviews).where(eq(reviews.id, id));
    await updateResourceRating(existing.resourceId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
