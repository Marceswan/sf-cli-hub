export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { resources, users, resourceTags, tags } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ResourceActions } from "@/components/admin/resource-actions";

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

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
  };

  const categoryLabels: Record<string, string> = {
    "cli-plugins": "CLI",
    "lwc-library": "LWC",
    "apex-utilities": "Apex",
    "agentforce": "Agent",
    "flow": "Flow",
    "experience-cloud": "ExpCloud",
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        All Resources ({allResources.length})
      </h2>

      {/* Mobile card view */}
      <div className="space-y-3 sm:hidden">
        {allResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-bg-card border border-border rounded-card p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {resource.name}
                  {resource.featured && (
                    <span className="ml-2 text-star text-xs">Featured</span>
                  )}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {resource.authorName || "Unknown"} &middot;{" "}
                  {formatDate(resource.createdAt)}
                </p>
              </div>
              <ResourceActions
                resourceId={resource.id}
                slug={resource.slug}
                status={resource.status}
                featured={resource.featured}
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge>{categoryLabels[resource.category]}</Badge>
              <Badge variant={statusVariant[resource.status]}>
                {resource.status}
              </Badge>
              {(tagsByResource[resource.id] || []).map((t) => (
                <Badge
                  key={t.id}
                  variant="primary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {t.name}
                </Badge>
              ))}
              <span className="text-xs text-text-muted ml-auto">
                {parseFloat(resource.avgRating || "0").toFixed(1)} (
                {resource.reviewsCount})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block bg-bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Tags
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Rating
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Author
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {allResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {resource.name}
                    {resource.featured && (
                      <span className="ml-2 text-star text-xs">Featured</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{categoryLabels[resource.category]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(tagsByResource[resource.id] || []).map((t) => (
                        <Badge
                          key={t.id}
                          variant="primary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[resource.status]}>
                      {resource.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {parseFloat(resource.avgRating || "0").toFixed(1)} (
                    {resource.reviewsCount})
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {resource.authorName || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(resource.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ResourceActions
                      resourceId={resource.id}
                      slug={resource.slug}
                      status={resource.status}
                      featured={resource.featured}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
