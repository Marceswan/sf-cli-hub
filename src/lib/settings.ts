import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export async function getRequireApproval(): Promise<boolean> {
  const [row] = await db.select().from(siteSettings).limit(1);
  return row?.requireApproval ?? true;
}

export async function getEmailSettings() {
  const [row] = await db.select().from(siteSettings).limit(1);
  return {
    emailWelcome: row?.emailWelcome ?? true,
    emailSubmissionReceived: row?.emailSubmissionReceived ?? true,
    emailSubmissionApproved: row?.emailSubmissionApproved ?? true,
    emailSubmissionRejected: row?.emailSubmissionRejected ?? true,
    emailAdminAlert: row?.emailAdminAlert ?? true,
    emailUserSuspended: row?.emailUserSuspended ?? true,
    emailUserBanned: row?.emailUserBanned ?? true,
    emailUserRestored: row?.emailUserRestored ?? true,
  };
}
