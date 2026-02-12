import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources, users } from "@/lib/db/schema";
import { eq, and, ilike, desc, asc, sql, SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { resourceSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { fetchReadmeAsHtml } from "@/lib/github";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const q = url.searchParams.get("q");
    const sort = url.searchParams.get("sort") || "newest";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const status = url.searchParams.get("status") || "approved";
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (status) {
      conditions.push(eq(resources.status, status as "pending" | "approved" | "rejected"));
    }
    if (category) {
      conditions.push(
        eq(resources.category, category as "cli-plugins" | "lwc-library" | "apex-utilities")
      );
    }
    if (q) {
      conditions.push(
        ilike(resources.name, `%${q}%`)
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (sort) {
      case "rating":
        orderBy = desc(resources.avgRating);
        break;
      case "reviews":
        orderBy = desc(resources.reviewsCount);
        break;
      case "oldest":
        orderBy = asc(resources.createdAt);
        break;
      case "name":
        orderBy = asc(resources.name);
        break;
      default:
        orderBy = desc(resources.createdAt);
    }

    const [data, countResult] = await Promise.all([
      db
        .select({
          id: resources.id,
          name: resources.name,
          slug: resources.slug,
          description: resources.description,
          category: resources.category,
          installCommand: resources.installCommand,
          iconEmoji: resources.iconEmoji,
          version: resources.version,
          status: resources.status,
          featured: resources.featured,
          avgRating: resources.avgRating,
          reviewsCount: resources.reviewsCount,
          createdAt: resources.createdAt,
          authorName: sql<string>`COALESCE(${resources.authorName}, ${users.name})`,
          authorImage: users.image,
        })
        .from(resources)
        .leftJoin(users, eq(resources.authorId, users.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(resources)
        .where(where),
    ]);

    return NextResponse.json({
      resources: data,
      pagination: {
        page,
        limit,
        total: Number(countResult[0].count),
        totalPages: Math.ceil(Number(countResult[0].count) / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = resourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let slug = slugify(data.name);

    // Ensure unique slug
    const [existing] = await db
      .select({ id: resources.id })
      .from(resources)
      .where(eq(resources.slug, slug))
      .limit(1);

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Auto-fetch README from GitHub and use as longDescription
    let longDescription = data.longDescription || null;
    if (data.repositoryUrl) {
      const readmeHtml = await fetchReadmeAsHtml(data.repositoryUrl);
      if (readmeHtml) {
        longDescription = readmeHtml;
      }
    }

    const [resource] = await db
      .insert(resources)
      .values({
        ...data,
        slug,
        longDescription,
        repositoryUrl: data.repositoryUrl || null,
        npmUrl: data.npmUrl || null,
        documentationUrl: data.documentationUrl || null,
        iconEmoji: data.iconEmoji || "📦",
        authorId: session.user.id,
        authorName: data.authorName || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(resource, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
