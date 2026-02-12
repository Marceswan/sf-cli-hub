import { db } from "@/lib/db";
import { resources, resourceScreenshots, resourceTags, tags } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { ResourceEditForm } from "@/components/resource/resource-edit-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditResourcePage({ params }: PageProps) {
  const user = await requireAuth();
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
      authorId: resources.authorId,
      authorName: resources.authorName,
    })
    .from(resources)
    .where(eq(resources.slug, slug))
    .limit(1);

  if (!resource) {
    notFound();
  }

  const isAdmin = user.role === "admin";
  const isOwner = resource.authorId === user.id;
  if (!isAdmin && !isOwner) {
    redirect(`/resources/${slug}`);
  }

  const [screenshots, resourceTagRows] = await Promise.all([
    db
      .select({
        id: resourceScreenshots.id,
        url: resourceScreenshots.url,
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-sm text-text-muted mb-8">
        <Link href={`/resources/${slug}`} className="hover:text-primary transition-colors">
          &larr; Back to {resource.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Edit Resource</h1>
      <p className="text-text-muted mb-8">
        Update the details for {resource.name}. Changes by the owner are
        automatically approved.
      </p>

      <ResourceEditForm resource={resource} screenshots={screenshots} tags={resourceTagRows} />
    </div>
  );
}
