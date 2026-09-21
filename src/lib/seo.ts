/**
 * Central SEO/GEO constants and helpers.
 * Canonical site URL mirrors the NEXT_PUBLIC_APP_URL convention used elsewhere.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com"
).replace(/\/$/, "");

export const SITE_NAME = "SFDX Hub";

export const SITE_DESCRIPTION =
  "The community-driven registry for high-performance Salesforce CLI plugins, reusable Lightning Web Components, and Apex utilities.";

export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/** JSON-LD graph for the site as a whole (WebSite + Organization). */
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Community-driven registry for Salesforce developer tools.",
      },
    ],
  };
}

/** JSON-LD for an individual listing (SoftwareApplication with aggregate rating). */
export function buildResourceJsonLd(resource: {
  name: string;
  slug: string;
  description: string;
  category: string;
  repositoryUrl?: string | null;
  npmUrl?: string | null;
  documentationUrl?: string | null;
  version?: string | null;
  avgRating?: string | null;
  reviewsCount?: number | null;
  authorName?: string | null;
  createdAt?: Date | null;
}) {
  const url = `${SITE_URL}/resources/${resource.slug}`;
  const offers: Record<string, unknown> = {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: resource.name,
    url,
    description: resource.description,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: resource.category,
    operatingSystem: "Salesforce Platform, Salesforce CLI",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    offers,
    author: {
      "@type": "Person",
      name: resource.authorName || "SFDX Hub community",
    },
  };

  if (resource.version) jsonLd.softwareVersion = resource.version;
  if (resource.repositoryUrl) jsonLd.codeRepository = resource.repositoryUrl;
  const sameAs = [resource.npmUrl, resource.documentationUrl].filter(
    Boolean
  ) as string[];
  if (sameAs.length) jsonLd.sameAs = sameAs;
  if (resource.createdAt) jsonLd.datePublished = resource.createdAt;

  const rating = parseFloat(resource.avgRating || "0");
  const count = resource.reviewsCount ?? 0;
  if (rating > 0 && count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      ratingCount: count,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return jsonLd;
}
