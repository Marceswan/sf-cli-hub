"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardIcon, CardMeta } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useImpressionTracker } from "@/hooks/use-impression-tracker";

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
  createdAt?: string;
  /** Analytics: listing UUID for impression tracking */
  listingId?: string;
  /** Analytics: surface identifier (e.g. "browse_grid", "home_featured") */
  surface?: string;
  /** Analytics: position index in the list */
  position?: number;
}

export function ResourceCard({
  slug,
  name,
  description,
  iconEmoji,
  installCommand,
  category,
  tags = [],
  createdAt,
  listingId,
  surface,
  position,
}: ResourceCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const impressionRef = useImpressionTracker(listingId, surface, position);
  const isLwc = category === "lwc-library";
  const isCli = category === "cli-plugins";
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - 3;

  function copyCommand(e: React.MouseEvent) {
    e.stopPropagation();
    if (!installCommand) return;
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      ref={impressionRef}
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/resources/${slug}`)}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(`/resources/${slug}`); }}
      className="cursor-pointer"
    >
      <Card className="h-full">
        <div>
          {/* Header row: icon + install command (CLI only) */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {isLwc ? (
              <div className="w-full h-[100px] bg-bg-surface rounded-lg border border-dashed border-border flex items-center justify-center text-text-muted text-xs">
                [ UI PREVIEW ]
              </div>
            ) : (
              <>
                <CardIcon className="mb-0 shrink-0">{iconEmoji}</CardIcon>
                {isCli && installCommand && (
                  <button
                    onClick={copyCommand}
                    className="flex items-center gap-1.5 max-w-[60%] px-2 py-1 rounded-md bg-bg-surface border border-border text-[11px] font-mono text-text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer group"
                    title={installCommand}
                  >
                    {copied ? (
                      <Check size={12} className="shrink-0 text-emerald-500" />
                    ) : (
                      <Copy size={12} className="shrink-0 opacity-50 group-hover:opacity-100" />
                    )}
                    <span className="truncate">
                      {copied ? "Copied!" : installCommand}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-text-muted text-[0.95rem] mb-3 flex-grow">
            {description}
          </p>
        </div>

        {/* Footer: tags + date */}
        <CardMeta>
          <div className="flex flex-wrap gap-1.5 min-w-0">
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
          <span className="text-xs whitespace-nowrap shrink-0 ml-2">
            {createdAt ? formatDate(createdAt) : "New"}
          </span>
        </CardMeta>
      </Card>
    </div>
  );
}
