export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { resources, users, resourceTags, tags } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { AdminResourcesTable } from "@/components/admin/admin-resources-table";

export default async function AdminResourcesPage() {
  const allResources = await db
    .select({
      id: resources.id,
      name: resources.name,
      slug: resources.slug,
      category: resources.category,
      status: resources.status,
      featured: resources.featured,
      avgRating: resources.avgRating,
      reviewsCount: resources.reviewsCount,
      createdAt: resources.createdAt,
      authorName: sql<string>`COALESCE(${resources.authorName}, ${users.name})`,
    })
    .from(resources)
    .leftJoin(users, eq(resources.authorId, users.id))
    .orderBy(sql`${resources.createdAt} desc`);

  // Batch-fetch tags for all resources
  const resourceIds = allResources.map((r) => r.id);
  let tagsByResource: Record<string, { id: string; name: string }[]> = {};
  if (resourceIds.length > 0) {
    const tagRows = await db
      .select({
        resourceId: resourceTags.resourceId,
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(resourceTags)
      .innerJoin(tags, eq(resourceTags.tagId, tags.id))
      .where(inArray(resourceTags.resourceId, resourceIds));

    tagsByResource = tagRows.reduce((acc, row) => {
      if (!acc[row.resourceId]) acc[row.resourceId] = [];
      acc[row.resourceId].push({ id: row.tagId, name: row.tagName });
      return acc;
    }, {} as typeof tagsByResource);
  }

  return (
    <AdminResourcesTable
      resources={allResources}
      tagsByResource={tagsByResource}
    />
  );
}
