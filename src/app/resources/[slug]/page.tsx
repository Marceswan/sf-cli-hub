import { db } from "@/lib/db";
import { resources, users, reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { InstallCommand } from "@/components/resource/install-command";
import { ReviewList } from "@/components/resource/review-list";
import { ReviewForm } from "@/components/resource/review-form";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth-utils";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;

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
      avgRating: resources.avgRating,
      reviewsCount: resources.reviewsCount,
      createdAt: resources.createdAt,
      authorId: resources.authorId,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(resources)
    .leftJoin(users, eq(resources.authorId, users.id))
    .where(eq(resources.slug, slug))
    .limit(1);

  if (!resource || resource.status !== "approved") {
    notFound();
  }

  const resourceReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
      userId: reviews.userId,
      userName: users.name,
      userImage: users.image,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.resourceId, resource.id));

  const currentUser = await getCurrentUser();

  const categoryLabels: Record<string, string> = {
    "cli-plugins": "CLI Plugin",
    "lwc-library": "LWC Component",
    "apex-utilities": "Apex Utility",
  };

  const hasReviewed = currentUser
    ? resourceReviews.some((r) => r.userId === currentUser.id)
    : false;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-text-muted mb-8">
        <Link href="/browse" className="hover:text-primary transition-colors">
          Browse
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/browse?category=${resource.category}`}
          className="hover:text-primary transition-colors"
        >
          {categoryLabels[resource.category]}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-main">{resource.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-bg-surface border border-border rounded-xl flex items-center justify-center text-3xl shrink-0">
              {resource.iconEmoji}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{resource.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge>{categoryLabels[resource.category]}</Badge>
                {resource.version && (
                  <Badge variant="primary">v{resource.version}</Badge>
                )}
                <div className="flex items-center gap-1.5">
                  <StarRating
                    rating={parseFloat(resource.avgRating || "0")}
                    size={16}
                  />
                  <span className="text-sm text-text-muted">
                    ({resource.reviewsCount})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-text-muted text-lg mb-8">{resource.description}</p>

          {resource.installCommand && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Installation</h2>
              <InstallCommand command={resource.installCommand} />
            </div>
          )}

          {resource.longDescription && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <div className="prose prose-invert max-w-none text-text-muted">
                {resource.longDescription}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">
              Reviews ({resource.reviewsCount})
            </h2>
            {currentUser && !hasReviewed && (
              <ReviewForm resourceId={resource.id} />
            )}
            <ReviewList reviews={resourceReviews} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border rounded-card p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Author</dt>
                <dd>{resource.authorName || "Anonymous"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Category</dt>
                <dd>{categoryLabels[resource.category]}</dd>
              </div>
              {resource.version && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Version</dt>
                  <dd>{resource.version}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-text-muted">Published</dt>
                <dd>{formatDate(resource.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Links */}
          <div className="bg-bg-card border border-border rounded-card p-6 space-y-3">
            <h3 className="font-semibold mb-4">Links</h3>
            {resource.repositoryUrl && (
              <a
                href={resource.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <Github size={16} />
                Repository
                <ExternalLink size={12} />
              </a>
            )}
            {resource.npmUrl && (
              <a
                href={resource.npmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <ExternalLink size={16} />
                npm Package
              </a>
            )}
            {resource.documentationUrl && (
              <a
                href={resource.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <ExternalLink size={16} />
                Documentation
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
