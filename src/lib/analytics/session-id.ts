/**
 * Anonymous analytics session identity.
 * 24-hour rotating session hash stored in a SameSite cookie.
 * Separate from the existing 1-year `vid` visitor cookie.
 */

const COOKIE_NAME = "asid";
const MAX_AGE = 60 * 60 * 24; // 24 hours

export function getAnalyticsSessionId(): string {
  if (typeof document === "undefined") return "";

  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (match) return match.split("=")[1];

  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const id = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  return id;
}
