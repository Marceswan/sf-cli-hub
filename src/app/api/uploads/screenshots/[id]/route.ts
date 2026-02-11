import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources, resourceScreenshots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

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

    // Fetch the screenshot + owning resource
    const [screenshot] = await db
      .select({
        id: resourceScreenshots.id,
        publicId: resourceScreenshots.publicId,
        resourceId: resourceScreenshots.resourceId,
      })
      .from(resourceScreenshots)
      .where(eq(resourceScreenshots.id, id))
      .limit(1);

    if (!screenshot) {
      return NextResponse.json(
        { error: "Screenshot not found" },
        { status: 404 }
      );
    }

    // Ownership / admin check
    const [resource] = await db
      .select({ authorId: resources.authorId })
      .from(resources)
      .where(eq(resources.id, screenshot.resourceId))
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

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(screenshot.publicId);

    // Delete DB row
    await db
      .delete(resourceScreenshots)
      .where(eq(resourceScreenshots.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Screenshot delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete screenshot" },
      { status: 500 }
    );
  }
}
