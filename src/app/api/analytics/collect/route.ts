import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews, resources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, visitorId, userId } = body as {
      path: string;
      referrer?: string;
      visitorId: string;
      userId?: string;
    };

    if (!path || !visitorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve category + resourceId from slug if this is a resource page
    let category: string | null = null;
    let resourceId: string | null = null;

    const resourceMatch = path.match(/^\/resource\/([^/?]+)/);
    if (resourceMatch) {
      const slug = resourceMatch[1];
      const [resource] = await db
        .select({ id: resources.id, category: resources.category })
        .from(resources)
        .where(eq(resources.slug, slug))
        .limit(1);

      if (resource) {
        category = resource.category;
        resourceId = resource.id;
      }
    }

    // Also resolve category from browse page query param
    const browseMatch = path.match(/^\/browse\?category=([^&]+)/);
    if (browseMatch) {
      category = browseMatch[1];
    }

    const [row] = await db
      .insert(pageViews)
      .values({
        path,
        referrer: referrer || null,
        visitorId,
        userId: userId || null,
        category: category as typeof pageViews.$inferInsert.category,
        resourceId,
        durationSeconds: 0,
      })
      .returning({ id: pageViews.id });

    return NextResponse.json({ viewId: row.id });
  } catch (err) {
    console.error("Analytics collect error:", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
