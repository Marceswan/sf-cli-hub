export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { TagManager } from "./tag-manager";

export default async function AdminTagsPage() {
  const allTags = await db
    .select()
    .from(tags)
    .orderBy(asc(tags.name));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Tags ({allTags.length})
      </h2>
      <TagManager initialTags={allTags} />
    </div>
  );
}
