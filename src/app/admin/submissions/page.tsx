export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { resources, users, resourceTags, tags } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { PendingSubmissions } from "@/components/admin/pending-submissions";

export default async function SubmissionsPage() {
  const submissions = await db
    .select({
      id: resources.id,
      name: resources.name,
      slug: resources.slug,
      description: resources.description,
      category: resources.category,
      status: resources.status,
      createdAt: resources.createdAt,
      authorName: sql<string>`COALESCE(${resources.authorName}, ${users.name})`,
      authorEmail: users.email,
    })
    .from(resources)
    .leftJoin(users, eq(resources.authorId, users.id))
    .where(eq(resources.status, "pending"))
    .orderBy(sql`${resources.createdAt} asc`);

  // Batch-fetch tags for submissions
  const submissionIds = submissions.map((s) => s.id);
  let tagsBySub: Record<string, { id: string; name: string }[]> = {};
  if (submissionIds.length > 0) {
    const tagRows = await db
      .select({
        resourceId: resourceTags.resourceId,
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(resourceTags)
      .innerJoin(tags, eq(resourceTags.tagId, tags.id))
      .where(inArray(resourceTags.resourceId, submissionIds));

    tagsBySub = tagRows.reduce((acc, row) => {
      if (!acc[row.resourceId]) acc[row.resourceId] = [];
      acc[row.resourceId].push({ id: row.tagId, name: row.tagName });
      return acc;
    }, {} as typeof tagsBySub);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Pending Submissions ({submissions.length})
      </h2>

      <PendingSubmissions
        submissions={submissions.map((s) => ({
          ...s,
          createdAt: String(s.createdAt),
          tags: tagsBySub[s.id] || [],
        }))}
      />
    </div>
  );
}
