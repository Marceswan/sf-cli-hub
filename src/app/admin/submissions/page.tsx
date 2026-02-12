export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { resources, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SubmissionActions } from "@/components/admin/submission-actions";

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

  const categoryLabels: Record<string, string> = {
    "cli-plugins": "CLI Plugin",
    "lwc-library": "LWC Component",
    "apex-utilities": "Apex Utility",
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Pending Submissions ({submissions.length})
      </h2>

      {submissions.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-card p-8 text-center">
          <p className="text-text-muted">No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-bg-card border border-border rounded-card p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{sub.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge>{categoryLabels[sub.category]}</Badge>
                    <span className="text-xs text-text-muted">
                      by {sub.authorName || sub.authorEmail} &middot;{" "}
                      {formatDate(sub.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-text-muted text-sm mb-4">{sub.description}</p>
              <SubmissionActions resourceId={sub.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
