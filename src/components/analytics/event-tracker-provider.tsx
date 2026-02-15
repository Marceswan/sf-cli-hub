"use client";

import { useEffect } from "react";
import { eventTracker } from "@/lib/analytics/event-tracker";

/**
 * Initializes the analytics event tracker at the app root level.
 * Mount alongside the existing PageViewTracker in the root layout.
 */
export function EventTrackerProvider() {
  useEffect(() => {
    eventTracker.init();
    return () => eventTracker.destroy();
  }, []);

  return null;
}
