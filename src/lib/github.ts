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
 * Uses GITHUB_TOKEN env var when available for higher rate limits.
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

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "sfdxhub",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );

    if (!res.ok) {
      console.error(`[fetchReadmeAsHtml] GitHub API ${res.status} for ${owner}/${repo}`);
      return null;
    }

    const json = await res.json();

    // Decode base64 content; fall back to download_url for large files
    let markdown: string;
    if (json.content) {
      markdown = Buffer.from(json.content, "base64").toString("utf-8");
    } else if (json.download_url) {
      const rawRes = await fetch(json.download_url);
      if (!rawRes.ok) {
        console.error(`[fetchReadmeAsHtml] download_url fetch ${rawRes.status}`);
        return null;
      }
      markdown = await rawRes.text();
    } else {
      console.error("[fetchReadmeAsHtml] No content or download_url in response");
      return null;
    }

    const html = await marked(markdown);
    const sanitized = sanitizeHtml(html, SANITIZE_OPTIONS);

    return sanitized || null;
  } catch (err) {
    console.error("[fetchReadmeAsHtml] Error:", err);
    return null;
  }
}
