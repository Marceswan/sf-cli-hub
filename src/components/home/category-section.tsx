"use client";

import Link from "next/link";
import { ResourceCard } from "@/components/resource/resource-card";
import { useGsapFadeIn } from "@/hooks/use-gsap";

interface CategoryResource {
  id?: string;
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  installCommand?: string;
  version?: string;
  avgRating?: number;
  reviewsCount?: number;
  category?: string;
  tags?: { id: string; name: string; slug: string }[];
  createdAt?: string;
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
  const headerRef = useGsapFadeIn({ y: 20, duration: 0.6 });
  const gridRef = useGsapFadeIn({
    y: 40,
    stagger: 0.1,
    childSelector: "[data-card]",
    start: "top 88%",
  });

  return (
    <div>
      <div ref={headerRef} className="flex justify-between items-end mb-8">
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

      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {resources.map((resource, index) => (
          <div key={resource.slug} data-card>
            <ResourceCard
              {...resource}
              listingId={resource.id}
              surface="home_featured"
              position={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
