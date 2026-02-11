import Link from "next/link";
import { ResourceCard } from "@/components/resource/resource-card";

interface CategoryResource {
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  installCommand?: string;
  version?: string;
  avgRating?: number;
  reviewsCount?: number;
  category?: string;
}

interface CategorySectionProps {
  title: string;
  subtitle: string;
  viewAllHref: string;
  resources: CategoryResource[];
}

export function CategorySection({
  title,
  subtitle,
  viewAllHref,
  resources,
}: CategorySectionProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-text-muted">{subtitle}</p>
        </div>
        <Link
          href={viewAllHref}
          className="text-primary font-semibold hover:underline whitespace-nowrap"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <ResourceCard key={resource.slug} {...resource} />
        ))}
      </div>
    </section>
  );
}
