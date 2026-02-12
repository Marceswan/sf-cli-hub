import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "details",
    "summary",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height"],
    a: ["href", "name", "target", "rel"],
  },
};

/**
 * Converts markdown or HTML input to sanitized HTML.
 * Accepts either format — marked passes HTML through unchanged.
 */
export async function markdownToSafeHtml(
  input: string
): Promise<string | null> {
  try {
    const html = await marked(input);
    const sanitized = sanitizeHtml(html, SANITIZE_OPTIONS);
    return sanitized || null;
  } catch {
    return null;
  }
}

/**
 * Fetches a GitHub repo's README and returns sanitized HTML.
 * Returns null on any failure (private repo, no README, network error).
 */
export async function fetchReadmeAsHtml(
  repositoryUrl: string
): Promise<string | null> {
  try {
    const match = repositoryUrl.match(
      /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/
    );
    if (!match) return null;

    const [, owner, repo] = match;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "sfdxhub",
        },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const markdown = Buffer.from(json.content, "base64").toString("utf-8");
    const html = await marked(markdown);

    const sanitized = sanitizeHtml(html, SANITIZE_OPTIONS);

    return sanitized || null;
  } catch {
    return null;
  }
}
