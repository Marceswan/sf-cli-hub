"use client";

import { useCallback } from "react";
import { eventTracker } from "@/lib/analytics/event-tracker";

interface OutboundLink {
  url: string;
  type: "repository" | "npm" | "documentation" | "website";
}

interface OutboundClickTrackerProps {
  listingId: string;
  links: OutboundLink[];
  children: (handleClick: (link: OutboundLink) => void) => React.ReactNode;
}

/**
 * Tracks outbound clicks from resource detail pages.
 * Uses a render-prop pattern so the parent controls rendering.
 */
export function OutboundClickTracker({
  listingId,
  links: _links,
  children,
}: OutboundClickTrackerProps) {
  const handleClick = useCallback(
    (link: OutboundLink) => {
      eventTracker.track({
        eventName: "listing.outbound_click",
        listingId,
        destinationType: link.type,
      });
    },
    [listingId]
  );

  return <>{children(handleClick)}</>;
}
