"use client";

import { useEffect, useRef } from "react";
import { eventTracker } from "@/lib/analytics/event-tracker";

/**
 * Tracks an impression when the element is 50%+ visible for >= 1 second.
 * Each listingId+surface pair fires only once per page load.
 */
export function useImpressionTracker(
  listingId: string | undefined,
  surface: string | undefined,
  position: number | undefined
) {
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!listingId || !surface || position === undefined) return;
    if (firedRef.current) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !firedRef.current) {
          timerRef.current = setTimeout(() => {
            if (!firedRef.current) {
              firedRef.current = true;
              eventTracker.trackImpression(listingId, surface, position);
            }
          }, 1000);
        } else if (!entry.isIntersecting && timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [listingId, surface, position]);

  return ref;
}
