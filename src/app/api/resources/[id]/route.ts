import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources, users, reviews, resourceTags, tags } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { fetchReadmeAsHtml, markdownToSafeHtml } from "@/lib/github";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [resource] = await db
      .select({
        id: resources.id,
        name: resources.name,
        slug: resources.slug,
        description: resources.description,
        longDescription: resources.longDescription,
        category: resources.category,
        installCommand: resources.installCommand,
        repositoryUrl: resources.repositoryUrl,
        npmUrl: resources.npmUrl,
        documentationUrl: resources.documentationUrl,
        iconEmoji: resources.iconEmoji,
        version: resources.version,
        status: resources.status,
        featured: resources.featured,
        avgRating: resources.avgRating,
        reviewsCount: resources.reviewsCount,
        createdAt: resources.createdAt,
        authorId: resources.authorId,
        authorName: sql<string>`COALESCE(${resources.authorName}, ${users.name})`,
        authorImage: users.image,
      })
      .from(resources)
      .leftJoin(users, eq(resources.authorId, users.id))
      .where(eq(resources.id, id))
      .limit(1);

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Fetch reviews and tags in parallel
    const [resourceReviews, resourceTagRows] = await Promise.all([
      db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          title: reviews.title,
          body: reviews.body,
          createdAt: reviews.createdAt,
          userName: users.name,
          userImage: users.image,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.resourceId, id)),
      db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(resourceTags)
        .innerJoin(tags, eq(resourceTags.tagId, tags.id))
        .where(eq(resourceTags.resourceId, id)),
    ]);

    return NextResponse.json({ ...resource, reviews: resourceReviews, tags: resourceTagRows });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
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

    // Get existing resource
    const [existing] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Only owner or admin can update
    const isAdmin = session.user.role === "admin";
    const isOwner = existing.authorId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Admin-only fields
    const updateData: Record<string, unknown> = {};
    if (isAdmin && body.status) updateData.status = body.status;
    if (isAdmin && body.featured !== undefined) updateData.featured = body.featured;

    // Owner/admin editable fields (longDescription handled separately below)
    const editableFields = [
      "name",
      "description",
      "installCommand",
      "repositoryUrl",
      "npmUrl",
      "documentationUrl",
      "iconEmoji",
      "version",
      "authorName",
    ] as const;

    for (const field of editableFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // Resolve longDescription: repo README takes priority, manual input as fallback
    const repoUrl = (updateData.repositoryUrl as string) || existing.repositoryUrl;
    if (repoUrl) {
      const readmeHtml = await fetchReadmeAsHtml(repoUrl);
      if (readmeHtml) {
        updateData.longDescription = readmeHtml;
      }
    }
    // If no repo or README fetch failed, process manual longDescription input
    if (!updateData.longDescription && body.longDescription) {
      const safeHtml = await markdownToSafeHtml(body.longDescription);
      if (safeHtml) {
        updateData.longDescription = safeHtml;
      }
    }

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(resources)
      .set(updateData)
      .where(eq(resources.id, id))
      .returning();

    // Update tags if provided
    if (Array.isArray(body.tagIds)) {
      await db.delete(resourceTags).where(eq(resourceTags.resourceId, id));
      if (body.tagIds.length > 0) {
        await db.insert(resourceTags).values(
          body.tagIds.map((tagId: string) => ({ resourceId: id, tagId }))
        );
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update resource" },
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

    const [resource] = await db
      .select({ authorId: resources.authorId })
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = resource.authorId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(resources).where(eq(resources.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
