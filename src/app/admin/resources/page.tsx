export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { resources, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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
      authorName: users.name,
    })
    .from(resources)
    .leftJoin(users, eq(resources.authorId, users.id))
    .orderBy(sql`${resources.createdAt} desc`);

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
  };

  const categoryLabels: Record<string, string> = {
    "cli-plugins": "CLI",
    "lwc-library": "LWC",
    "apex-utilities": "Apex",
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        All Resources ({allResources.length})
      </h2>

      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
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
                <tr key={resource.id} className="border-b border-border last:border-0">
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
