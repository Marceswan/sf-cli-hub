import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import type { FeatureFlagKey, FeatureFlags } from "@/types";

const DEFAULT_FLAGS: FeatureFlags = {
  pro: false,
};

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

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const [row] = await db.select().from(siteSettings).limit(1);
  const dbFlags = (row?.featureFlags ?? {}) as Record<string, boolean>;
  return { ...DEFAULT_FLAGS, ...dbFlags };
}

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key] ?? false;
}
