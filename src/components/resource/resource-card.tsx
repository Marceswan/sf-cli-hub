"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardIcon, CardMeta } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";

interface TagInfo {
  id: string;
  name: string;
  slug: string;
}

interface ResourceCardProps {
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  installCommand?: string;
  version?: string;
  avgRating?: number;
  reviewsCount?: number;
  category?: string;
  tags?: TagInfo[];
}

export function ResourceCard({
  slug,
  name,
  description,
  iconEmoji,
  installCommand,
  version,
  avgRating = 0,
  reviewsCount = 0,
  category,
  tags = [],
}: ResourceCardProps) {
  const router = useRouter();
  const isLwc = category === "lwc-library";
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - 3;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/resources/${slug}`)}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(`/resources/${slug}`); }}
      className="cursor-pointer"
    >
      <Card className="h-full">
        <div>
          {isLwc ? (
            <div className="h-[100px] bg-bg-surface mb-4 rounded-lg border border-dashed border-border flex items-center justify-center text-text-muted text-xs">
              [ UI PREVIEW ]
            </div>
          ) : (
            <CardIcon>{iconEmoji}</CardIcon>
          )}
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-text-muted text-[0.95rem] mb-3 flex-grow">
            {description}
          </p>
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {visibleTags.map((t) => (
                <Link
                  key={t.id}
                  href={`/browse?tag=${t.slug}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="primary" className="text-[10px] px-2 py-0 hover:opacity-80 transition-opacity">
                    {t.name}
                  </Badge>
                </Link>
              ))}
              {extraCount > 0 && (
                <Badge className="text-[10px] px-2 py-0">+{extraCount}</Badge>
              )}
            </div>
          )}
        </div>
        <CardMeta>
          <span className="truncate max-w-[60%]">
            {installCommand || (version ? `v${version}` : category)}
          </span>
          <span className="flex items-center gap-1.5">
            {avgRating > 0 ? (
              <>
                <StarRating rating={avgRating} size={14} />
                <span className="text-xs">({reviewsCount})</span>
              </>
            ) : (
              <span className="text-xs">New</span>
            )}
          </span>
        </CardMeta>
      </Card>
    </div>
  );
}
