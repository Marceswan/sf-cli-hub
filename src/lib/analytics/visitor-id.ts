/**
 * Cookie-based anonymous visitor identity.
 * Returns an existing UUID from the `vid` cookie or generates a new one.
 */

const COOKIE_NAME = "vid";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function getVisitorId(): string {
  if (typeof document === "undefined") return "";

  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (match) return match.split("=")[1];

  const id = crypto.randomUUID();
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  return id;
}
