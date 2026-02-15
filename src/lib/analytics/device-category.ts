/**
 * Simple device category detection based on viewport width.
 */
export function getDeviceCategory(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
