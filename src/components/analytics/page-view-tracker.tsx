"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getVisitorId } from "@/lib/analytics/visitor-id";

export function PageViewTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const viewIdRef = useRef<string | null>(null);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    // Reset timing for new page
    startRef.current = Date.now();
    viewIdRef.current = null;

    // Record page view
    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || undefined,
        visitorId,
        userId: session?.user?.id || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.viewId) viewIdRef.current = data.viewId;
      })
      .catch(() => {});

    // Send duration on page leave via beacon
    function sendDuration() {
      const viewId = viewIdRef.current;
      if (!viewId) return;

      const duration = Math.round((Date.now() - startRef.current) / 1000);
      if (duration < 1) return;

      const payload = JSON.stringify({ viewId, duration });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/analytics/duration",
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch("/api/analytics/duration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }

    // Visibility API — send duration when tab becomes hidden
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        sendDuration();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", sendDuration);

    return () => {
      sendDuration();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", sendDuration);
    };
  }, [pathname, session?.user?.id]);

  return null;
}
