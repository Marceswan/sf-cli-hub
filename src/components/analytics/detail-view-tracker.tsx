"use client";

import { useEffect, useRef } from "react";
import { eventTracker } from "@/lib/analytics/event-tracker";

interface DetailViewTrackerProps {
  listingId: string;
}

export function DetailViewTracker({ listingId }: DetailViewTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    eventTracker.track({
      eventName: "listing.detail_view",
      listingId,
      surface: "detail_page",
      referrer: typeof document !== "undefined" ? document.referrer : null,
    });
  }, [listingId]);

  return null;
}
