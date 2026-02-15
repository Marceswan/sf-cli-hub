import { db } from "@/lib/db";
import { resources, resourceTags, tags, siteSettings } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { HeroSection } from "@/components/home/hero-section";
import { CategorySection } from "@/components/home/category-section";
import { ContentBand } from "@/components/layout/content-band";

export const dynamic = "force-dynamic";

type CategorySlug = "cli-plugins" | "lwc-library" | "apex-utilities" | "agentforce" | "flow" | "experience-cloud";

async function getTopResources(category: CategorySlug, limit = 3) {
  const rows = await db
    .select({
      id: resources.id,
      slug: resources.slug,
      name: resources.name,
      description: resources.description,
      iconEmoji: resources.iconEmoji,
      installCommand: resources.installCommand,
      version: resources.version,
      avgRating: resources.avgRating,
      reviewsCount: resources.reviewsCount,
      category: resources.category,
      createdAt: resources.createdAt,
    })
    .from(resources)
    .where(and(eq(resources.category, category), eq(resources.status, "approved")))
    .orderBy(desc(resources.createdAt))
    .limit(limit);

  // Batch-fetch tags
  const ids = rows.map((r) => r.id);
  let tagMap: Record<string, { id: string; name: string; slug: string }[]> = {};
  if (ids.length > 0) {
    const tagRows = await db
      .select({
        resourceId: resourceTags.resourceId,
        tagId: tags.id,
        tagName: tags.name,
        tagSlug: tags.slug,
      })
      .from(resourceTags)
      .innerJoin(tags, eq(resourceTags.tagId, tags.id))
      .where(inArray(resourceTags.resourceId, ids));

    tagMap = tagRows.reduce((acc, row) => {
      if (!acc[row.resourceId]) acc[row.resourceId] = [];
      acc[row.resourceId].push({ id: row.tagId, name: row.tagName, slug: row.tagSlug });
      return acc;
    }, {} as typeof tagMap);
  }

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    iconEmoji: r.iconEmoji,
    installCommand: r.installCommand || undefined,
    version: r.version || undefined,
    avgRating: r.avgRating ? parseFloat(r.avgRating) : 0,
    reviewsCount: r.reviewsCount,
    category: r.category,
    tags: tagMap[r.id] || [],
    createdAt: r.createdAt.toISOString(),
  }));
}

const sections = [
  { category: "cli-plugins" as CategorySlug, title: "CLI Power-Ups", subtitle: "Extend your terminal capabilities.", variant: "filled" as const },
  { category: "lwc-library" as CategorySlug, title: "LWC Blueprint", subtitle: "Drop-in UI components for your org.", variant: "default" as const },
  { category: "apex-utilities" as CategorySlug, title: "Apex Utilities", subtitle: "Battle-tested classes and frameworks.", variant: "filled" as const },
  { category: "agentforce" as CategorySlug, title: "Agentforce", subtitle: "AI-powered agent tools and extensions.", variant: "default" as const },
  { category: "flow" as CategorySlug, title: "Flow", subtitle: "Automation components and templates.", variant: "filled" as const },
  { category: "experience-cloud" as CategorySlug, title: "Experience Cloud", subtitle: "Components for portals and communities.", variant: "default" as const },
];

export default async function HomePage() {
  const [categoryData, [settingsRow]] = await Promise.all([
    Promise.all(sections.map((s) => getTopResources(s.category))),
    db.select().from(siteSettings).limit(1),
  ]);

  const heroWords = settingsRow?.heroWords
    ? settingsRow.heroWords.split(",").map((w) => w.trim()).filter(Boolean)
    : undefined;

  // Only render sections that have at least 1 resource
  const activeSections = sections
    .map((s, i) => ({ ...s, resources: categoryData[i] }))
    .filter((s) => s.resources.length > 0);

  return (
    <>
      <HeroSection heroWords={heroWords} />

      {activeSections.map((section) => (
        <ContentBand key={section.category} variant={section.variant}>
          <CategorySection
            title={section.title}
            subtitle={section.subtitle}
            viewAllHref={`/browse?category=${section.category}`}
            resources={section.resources}
          />
        </ContentBand>
      ))}
    </>
  );
}
