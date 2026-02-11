import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources, resourceScreenshots } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

const MAX_SCREENSHOTS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const resourceId = formData.get("resourceId") as string;
    const file = formData.get("file") as File | null;

    if (!resourceId || !file) {
      return NextResponse.json(
        { error: "resourceId and file are required" },
        { status: 400 }
      );
    }

    // Ownership / admin check
    const [resource] = await db
      .select({ authorId: resources.authorId })
      .from(resources)
      .where(eq(resources.id, resourceId))
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

    // Count check
    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(resourceScreenshots)
      .where(eq(resourceScreenshots.resourceId, resourceId));

    if (existingCount >= MAX_SCREENSHOTS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_SCREENSHOTS} screenshots allowed` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 5 MB" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary via buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `sf-cli-hub/resources/${resourceId}`,
            quality: "auto",
            fetch_format: "auto",
            transformation: [{ width: 1920, crop: "limit" }],
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error("Upload failed"));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(buffer);
      }
    );

    // Insert DB row
    const [screenshot] = await db
      .insert(resourceScreenshots)
      .values({
        resourceId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        displayOrder: existingCount,
      })
      .returning();

    return NextResponse.json(screenshot, { status: 201 });
  } catch (err) {
    console.error("Screenshot upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload screenshot" },
      { status: 500 }
    );
  }
}
