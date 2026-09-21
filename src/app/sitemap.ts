import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  let approved: { slug: string; createdAt: Date | null }[] = [];
  try {
    approved = await db
      .select({ slug: resources.slug, createdAt: resources.createdAt })
      .from(resources)
      .where(eq(resources.status, "approved"))
      .orderBy(desc(resources.createdAt))
      .limit(5000);
  } catch {
    // Sitemap must not 500 if the DB is briefly unavailable — ship static routes.
  }

  return [
    ...staticRoutes,
    ...approved.map((r) => ({
      url: `${SITE_URL}/resources/${r.slug}`,
      lastModified: r.createdAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
