import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export async function getRequireApproval(): Promise<boolean> {
  const [row] = await db.select().from(siteSettings).limit(1);
  return row?.requireApproval ?? true;
}
