import { wrapInLayout } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com";

export interface DigestListing {
  name: string;
  slug: string;
  impressions: number;
  detailViews: number;
  outboundClicks: number;
  prevImpressions: number;
  prevDetailViews: number;
  prevOutboundClicks: number;
}

/**
 * Calculates the delta between current and previous values and returns
 * an HTML string with a colored arrow and percentage
 */
function getDelta(current: number, previous: number): string {
  if (previous === 0 && current === 0) {
    return `<span style="color:#71717a;">—</span>`;
  }

  const delta = current - previous;

  if (delta === 0) {
    return `<span style="color:#71717a;">—</span>`;
  }

  if (delta > 0) {
    const percentage = previous === 0 ? 100 : Math.round((delta / previous) * 100);
    return `<span style="color:#22c55e;">↑ ${percentage}%</span>`;
  }

  const percentage = previous === 0 ? 100 : Math.round((Math.abs(delta) / previous) * 100);
  return `<span style="color:#ef4444;">↓ ${percentage}%</span>`;
}

/**
 * Builds the HTML content for the weekly analytics digest email
 */
export function buildDigestContent(
  userName: string,
  listings: DigestListing[],
  unsubscribeUrl: string
): string {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  // Find the best performer by impressions
  const bestPerformer = listings.reduce((best, current) => {
    return current.impressions > best.impressions ? current : best;
  }, listings[0]);

  const listingRows = listings
    .map(
      (listing) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e4e4e7;">
            <a href="${BASE_URL}/resources/${listing.slug}" style="color:#3b82f6;text-decoration:none;font-weight:500;">
              ${listing.name}
            </a>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e4e4e7;text-align:center;">
            ${listing.impressions.toLocaleString()}
            <br/>
            <span style="font-size:12px;">${getDelta(listing.impressions, listing.prevImpressions)}</span>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e4e4e7;text-align:center;">
            ${listing.detailViews.toLocaleString()}
            <br/>
            <span style="font-size:12px;">${getDelta(listing.detailViews, listing.prevDetailViews)}</span>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e4e4e7;text-align:center;">
            ${listing.outboundClicks.toLocaleString()}
            <br/>
            <span style="font-size:12px;">${getDelta(listing.outboundClicks, listing.prevOutboundClicks)}</span>
          </td>
        </tr>
      `
    )
    .join("");

  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Your Weekly Analytics Digest</h1>
    <p style="margin:0 0 24px;font-size:16px;color:#3f3f46;line-height:1.6;">
      ${greeting}
    </p>
    <p style="margin:0 0 24px;font-size:16px;color:#3f3f46;line-height:1.6;">
      Here's how your resources performed this week:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background-color:#f4f4f5;">
          <th style="padding:12px 8px;text-align:left;font-size:13px;font-weight:600;color:#52525b;">Resource</th>
          <th style="padding:12px 8px;text-align:center;font-size:13px;font-weight:600;color:#52525b;">Impressions</th>
          <th style="padding:12px 8px;text-align:center;font-size:13px;font-weight:600;color:#52525b;">Views</th>
          <th style="padding:12px 8px;text-align:center;font-size:13px;font-weight:600;color:#52525b;">Clicks</th>
        </tr>
      </thead>
      <tbody style="background-color:#ffffff;">
        ${listingRows}
      </tbody>
    </table>

    ${
      bestPerformer
        ? `
    <div style="margin:0 0 24px;padding:16px;background-color:#f0f9ff;border-left:4px solid #3b82f6;border-radius:6px;">
      <p style="margin:0;font-size:14px;color:#0c4a6e;">
        <strong>Your best performer this week:</strong> <a href="${BASE_URL}/resources/${bestPerformer.slug}" style="color:#3b82f6;text-decoration:none;">${bestPerformer.name}</a> with ${bestPerformer.impressions.toLocaleString()} impressions
      </p>
    </div>
    `
        : ""
    }

    <div style="margin:0 0 24px;">
      <a href="${BASE_URL}/dashboard/analytics" style="display:inline-block;padding:12px 24px;background-color:#3b82f6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
        View Full Dashboard
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#71717a;">
      Want to stop receiving these emails? <a href="${unsubscribeUrl}" style="color:#3b82f6;text-decoration:none;">Unsubscribe</a>
    </p>
  `;

  return wrapInLayout(content);
}
