import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources, analyticsDaily } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

type BadgeStyle = "flat" | "flat-square" | "for-the-badge";

function makeBadgeSvg(count: number, style: BadgeStyle): string {
  const label = "SFDXHub";
  const message = `${count.toLocaleString()} developers`;

  // Calculate widths based on text length (approximate)
  const labelWidth = label.length * 7 + 10;
  const messageWidth = message.length * 7 + 10;
  const totalWidth = labelWidth + messageWidth;

  // Style-specific properties
  const radius = style === "flat-square" ? 0 : style === "for-the-badge" ? 4 : 3;
  const fontSize = style === "for-the-badge" ? 11 : 11;
  const height = style === "for-the-badge" ? 28 : 20;
  const textTransform = style === "for-the-badge" ? "text-transform: uppercase;" : "";

  // Vertical positioning (as percentage of height for better scaling)
  const textY = height * 0.68;
  const shadowY = height * 0.7;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="#00a1e0"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${fontSize}" style="${textTransform}">
    <text x="${labelWidth / 2}" y="${shadowY}" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="${textY}">${label}</text>
    <text x="${labelWidth + messageWidth / 2}" y="${shadowY}" fill="#010101" fill-opacity=".3">${message}</text>
    <text x="${labelWidth + messageWidth / 2}" y="${textY}">${message}</text>
  </g>
</svg>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;

    // Strip .svg extension if present
    const slug = rawSlug.endsWith(".svg")
      ? rawSlug.slice(0, -4)
      : rawSlug;

    // Get style from query params (default: flat)
    const { searchParams } = new URL(req.url);
    const styleParam = searchParams.get("style") || "flat";
    const style: BadgeStyle = ["flat", "flat-square", "for-the-badge"].includes(
      styleParam
    )
      ? (styleParam as BadgeStyle)
      : "flat";

    // Get the resource by slug
    const resource = await db
      .select({ id: resources.id })
      .from(resources)
      .where(eq(resources.slug, slug))
      .limit(1);

    if (!resource || resource.length === 0) {
      // Return a badge showing 0 developers if resource not found
      const svg = makeBadgeSvg(0, style);
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    const listingId = resource[0].id;

    // Sum unique_sessions from analyticsDaily for this listing
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${analyticsDaily.uniqueSessions}), 0)`,
      })
      .from(analyticsDaily)
      .where(eq(analyticsDaily.listingId, listingId));

    const developerCount = Number(result[0]?.total || 0);

    // Generate SVG badge
    const svg = makeBadgeSvg(developerCount, style);

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[Badge] Error:", err);

    // Return error badge
    const errorSvg = makeBadgeSvg(0, "flat");
    return new Response(errorSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
      status: 500,
    });
  }
}
