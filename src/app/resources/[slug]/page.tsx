import { db } from "@/lib/db";
import { resources, users, reviews, resourceScreenshots, resourceTags, tags } from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { InstallCommand } from "@/components/resource/install-command";
import { ReviewList } from "@/components/resource/review-list";
import { ReviewForm } from "@/components/resource/review-form";
import { ScreenshotGallery } from "@/components/resource/screenshot-gallery";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth-utils";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { ResourceOwnerActions } from "@/components/resource/resource-owner-actions";

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
      authorName: sql<string>`COALESCE(${resources.authorName}, ${users.name})`,
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

  const [screenshots, resourceTagRows] = await Promise.all([
    db
      .select({
        id: resourceScreenshots.id,
        url: resourceScreenshots.url,
        alt: resourceScreenshots.alt,
        displayOrder: resourceScreenshots.displayOrder,
      })
      .from(resourceScreenshots)
      .where(eq(resourceScreenshots.resourceId, resource.id))
      .orderBy(asc(resourceScreenshots.displayOrder)),
    db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(resourceTags)
      .innerJoin(tags, eq(resourceTags.tagId, tags.id))
      .where(eq(resourceTags.resourceId, resource.id)),
  ]);

  const currentUser = await getCurrentUser();

  const categoryLabels: Record<string, string> = {
    "cli-plugins": "CLI Plugin",
    "lwc-library": "LWC Component",
    "apex-utilities": "Apex Utility",
    "agentforce": "Agentforce",
    "flow": "Flow",
    "experience-cloud": "Experience Cloud",
  };

  const hasReviewed = currentUser
    ? resourceReviews.some((r) => r.userId === currentUser.id)
    : false;

  const isOwnerOrAdmin =
    currentUser &&
    (currentUser.id === resource.authorId || currentUser.role === "admin");

  return (
    <div className="grid grid-cols-[1fr_minmax(0,1200px)_1fr]">
      <div className="max-sm:hidden grid-line-pattern" />
      <div className="col-start-2 px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm text-text-muted">
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
        {isOwnerOrAdmin && (
          <ResourceOwnerActions
            resourceId={resource.id}
            slug={resource.slug}
          />
        )}
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
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge>{categoryLabels[resource.category]}</Badge>
                {resourceTagRows.map((t) => (
                  <Link key={t.id} href={`/browse?tag=${t.slug}`}>
                    <Badge variant="primary" className="hover:opacity-80 transition-opacity">{t.name}</Badge>
                  </Link>
                ))}
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

          {screenshots.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Screenshots</h2>
              <ScreenshotGallery screenshots={screenshots} />
            </div>
          )}

          {resource.installCommand && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Installation</h2>
              <InstallCommand command={resource.installCommand} />
            </div>
          )}

          {resource.longDescription && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              {/* Safe: HTML is sanitized with DOMPurify at storage time in fetchReadmeAsHtml() */}
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: resource.longDescription }}
              />
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
              {resourceTagRows.length > 0 && (
                <div>
                  <dt className="text-text-muted mb-1.5">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {resourceTagRows.map((t) => (
                      <Link key={t.id} href={`/browse?tag=${t.slug}`}>
                        <Badge variant="primary" className="text-[10px] px-2 hover:opacity-80 transition-opacity">
                          {t.name}
                        </Badge>
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
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
      <div className="max-sm:hidden grid-line-pattern" />
    </div>
  );
}
