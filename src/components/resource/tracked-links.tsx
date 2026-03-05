"use client";

import { Github, ExternalLink } from "lucide-react";
import { eventTracker } from "@/lib/analytics/event-tracker";

interface TrackedLinksProps {
  listingId: string;
  repositoryUrl?: string | null;
  npmUrl?: string | null;
  documentationUrl?: string | null;
}

export function TrackedLinks({
  listingId,
  repositoryUrl,
  npmUrl,
  documentationUrl,
}: TrackedLinksProps) {
  function trackOutbound(type: string) {
    eventTracker.track({
      eventName: "listing.outbound_click",
      listingId,
      destinationType: type,
    });
  }

  return (
    <div className="bg-bg-card border border-border rounded-card p-6 space-y-3">
      <h3 className="font-semibold mb-4">Links</h3>
      {repositoryUrl && (
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackOutbound("repository")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <Github size={16} />
          Repository
          <ExternalLink size={12} />
        </a>
      )}
      {npmUrl && (
        <a
          href={npmUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackOutbound("npm")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <ExternalLink size={16} />
          npm Package
        </a>
      )}
      {documentationUrl && (
        <a
          href={documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackOutbound("documentation")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <ExternalLink size={16} />
          Documentation
        </a>
      )}
    </div>
  );
}
