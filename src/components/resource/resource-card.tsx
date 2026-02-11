import Link from "next/link";
import { Card, CardIcon, CardMeta } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";

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
}: ResourceCardProps) {
  const isLwc = category === "lwc-library";

  return (
    <Link href={`/resources/${slug}`}>
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
          <p className="text-text-muted text-[0.95rem] mb-6 flex-grow">
            {description}
          </p>
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
    </Link>
  );
}
