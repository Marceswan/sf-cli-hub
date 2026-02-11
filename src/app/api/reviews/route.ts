import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, resources } from "@/lib/db/schema";
import { eq, avg, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { resourceId, rating, title, body: reviewBody } = parsed.data;

    // Verify resource exists and is approved
    const [resource] = await db
      .select({ id: resources.id, status: resources.status })
      .from(resources)
      .where(eq(resources.id, resourceId))
      .limit(1);

    if (!resource || resource.status !== "approved") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const [review] = await db
      .insert(reviews)
      .values({
        resourceId,
        userId: session.user.id,
        rating,
        title: title || null,
        body: reviewBody || null,
      })
      .returning();

    await updateResourceRating(resourceId);

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    // Handle unique constraint violation (user already reviewed)
    if (err instanceof Error && err.message.includes("unique")) {
      return NextResponse.json(
        { error: "You have already reviewed this resource" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
