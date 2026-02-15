"use client";

import { getAnalyticsSessionId } from "./session-id";
import { getDeviceCategory } from "./device-category";
import { isTrackingAllowed } from "./privacy";

interface AnalyticsEventPayload {
  eventName:
    | "listing.impression"
    | "listing.detail_view"
    | "listing.outbound_click"
    | "listing.tag_click"
    | "listing.share"
    | "listing.bookmark";
  listingId: string;
  surface?: string | null;
  position?: number | null;
  destinationType?: string | null;
  searchQuery?: string | null;
  referrer?: string | null;
}

interface QueuedEvent extends AnalyticsEventPayload {
  sessionId: string;
  deviceCategory: "desktop" | "mobile" | "tablet";
}

const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH_SIZE = 20;
const API_URL = "/api/analytics/events";

class EventTracker {
  private queue: QueuedEvent[] = [];
  private impressionsSeen = new Set<string>();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    if (!isTrackingAllowed()) return;

    this.initialized = true;
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
    this.initialized = false;
    this.impressionsSeen.clear();

    if (typeof window !== "undefined") {
      window.removeEventListener("visibilitychange", this.handleVisibilityChange);
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    }
  }

  track(event: AnalyticsEventPayload) {
    if (!this.initialized) return;

    const sessionId = getAnalyticsSessionId();
    if (!sessionId) return;

    this.queue.push({
      ...event,
      sessionId,
      deviceCategory: getDeviceCategory(),
    });

    if (this.queue.length >= MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  trackImpression(listingId: string, surface: string, position: number) {
    const key = `${listingId}:${surface}`;
    if (this.impressionsSeen.has(key)) return;
    this.impressionsSeen.add(key);

    this.track({
      eventName: "listing.impression",
      listingId,
      surface,
      position,
    });
  }

  private flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, MAX_BATCH_SIZE);
    const payload = JSON.stringify({ events: batch });

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently drop failed events — analytics should never break the app
    });
  }

  private flushBeacon() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, MAX_BATCH_SIZE);
    const payload = JSON.stringify({ events: batch });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        API_URL,
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.flushBeacon();
    }
  };

  private handleBeforeUnload = () => {
    this.flushBeacon();
  };
}

export const eventTracker = new EventTracker();
