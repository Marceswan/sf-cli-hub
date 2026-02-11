export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { resources, reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await requireAuth();

  const userResources = await db
    .select({
      id: resources.id,
      name: resources.name,
      slug: resources.slug,
      category: resources.category,
      status: resources.status,
      avgRating: resources.avgRating,
      reviewsCount: resources.reviewsCount,
      createdAt: resources.createdAt,
    })
    .from(resources)
    .where(eq(resources.authorId, user.id));

  const userReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      createdAt: reviews.createdAt,
      resourceId: reviews.resourceId,
    })
    .from(reviews)
    .where(eq(reviews.userId, user.id));

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-bg-surface border border-border flex items-center justify-center text-2xl font-bold">
          {user.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name || "User"}</h1>
          <p className="text-text-muted text-sm">{user.email}</p>
          {user.role === "admin" && (
            <Badge variant="primary" className="mt-1">
              Admin
            </Badge>
          )}
        </div>
      </div>

      {/* My Submissions */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          My Submissions ({userResources.length})
        </h2>
        {userResources.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-card p-8 text-center">
            <p className="text-text-muted">You haven&apos;t submitted any tools yet.</p>
            <Link href="/submit" className="text-primary hover:underline text-sm mt-2 inline-block">
              Submit your first tool
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-bg-card border border-border rounded-card p-4 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/resources/${resource.slug}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {resource.name}
                  </Link>
                  <p className="text-xs text-text-muted mt-1">
                    {formatDate(resource.createdAt)}
                  </p>
                </div>
                <Badge variant={statusVariant[resource.status]}>
                  {resource.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Reviews */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          My Reviews ({userReviews.length})
        </h2>
        {userReviews.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-card p-8 text-center">
            <p className="text-text-muted">You haven&apos;t written any reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userReviews.map((review) => (
              <div
                key={review.id}
                className="bg-bg-card border border-border rounded-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {review.title || "Untitled Review"}
                  </span>
                  <span className="text-star text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
