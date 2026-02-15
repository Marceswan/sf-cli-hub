/**
 * Checks whether analytics tracking is allowed based on
 * Do Not Track (DNT) and Global Privacy Control (GPC) signals.
 */
export function isTrackingAllowed(): boolean {
  if (typeof navigator === "undefined") return true;

  // Do Not Track
  if (navigator.doNotTrack === "1") return false;

  // Global Privacy Control
  if ((navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true) {
    return false;
  }

  return true;
}
