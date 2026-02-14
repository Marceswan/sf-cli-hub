import { Resend } from "resend";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getEmailSettings } from "@/lib/settings";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "SFDX Hub <noreply@sfdxhub.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com";

// ─── Shared HTML Layout ───

function wrapInLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:24px 32px;">
              <img src="${BASE_URL}/email-logo.png" alt="SFDX Hub" width="160" height="28" style="display:block;border:0;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e4e4e7;color:#71717a;font-size:13px;">
              <a href="${BASE_URL}" style="color:#3b82f6;text-decoration:none;">sfdxhub.com</a> &mdash; The Salesforce Developer Resource Hub
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email Templates ───

function welcomeEmailContent(userName: string) {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  return {
    subject: "Welcome to SFDX Hub!",
    html: wrapInLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Welcome to SFDX Hub!</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        ${greeting}
      </p>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        Thanks for joining SFDX Hub &mdash; the community-driven resource hub for Salesforce developers.
        You can now browse tools, submit your own resources, and leave reviews.
      </p>
      <a href="${BASE_URL}/submit" style="display:inline-block;padding:12px 24px;background-color:#3b82f6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
        Submit a Resource
      </a>
    `),
  };
}

function submissionReceivedContent(userName: string, resourceName: string) {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  return {
    subject: `Submission received: ${resourceName}`,
    html: wrapInLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Submission Received</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        ${greeting}
      </p>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        Your resource <strong>${resourceName}</strong> has been submitted and is pending review.
        We&rsquo;ll notify you once it&rsquo;s been approved.
      </p>
      <p style="margin:0;font-size:14px;color:#71717a;">
        Most submissions are reviewed within 24 hours.
      </p>
    `),
  };
}

function submissionApprovedContent(
  userName: string,
  resourceName: string,
  resourceSlug: string
) {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  return {
    subject: `Approved: ${resourceName} is now live!`,
    html: wrapInLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Your Resource is Live!</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        ${greeting}
      </p>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        Great news &mdash; <strong>${resourceName}</strong> has been approved and is now live on SFDX Hub.
      </p>
      <a href="${BASE_URL}/resources/${resourceSlug}" style="display:inline-block;padding:12px 24px;background-color:#22c55e;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
        View Your Resource
      </a>
    `),
  };
}

function submissionRejectedContent(userName: string, resourceName: string) {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  return {
    subject: `Update on your submission: ${resourceName}`,
    html: wrapInLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Submission Update</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        ${greeting}
      </p>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        Unfortunately, <strong>${resourceName}</strong> wasn&rsquo;t approved at this time.
        This could be due to incomplete information or it not meeting our current guidelines.
      </p>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        You&rsquo;re welcome to update your submission and resubmit.
      </p>
      <a href="${BASE_URL}/submit" style="display:inline-block;padding:12px 24px;background-color:#3b82f6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
        Resubmit a Resource
      </a>
    `),
  };
}

function adminSubmissionAlertContent(resourceName: string, authorName: string) {
  return {
    subject: `New submission from ${authorName}: ${resourceName}`,
    html: wrapInLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">New Submission for Review</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#3f3f46;line-height:1.6;">
        <strong>${authorName}</strong> just submitted <strong>${resourceName}</strong> for review.
      </p>
      <a href="${BASE_URL}/admin/submissions" style="display:inline-block;padding:12px 24px;background-color:#3b82f6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
        Review Submissions
      </a>
    `),
  };
}

// ─── Send Functions (fire-and-forget) ───

export async function sendWelcomeEmail(email: string, userName: string) {
  try {
    const settings = await getEmailSettings();
    if (!settings.emailWelcome) return;
    const { subject, html } = welcomeEmailContent(userName);
    await getResend()?.emails.send({ from: FROM, to: email, subject, html });
    console.log(`[email] Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`[email] Failed to send welcome email to ${email}:`, error);
  }
}

export async function sendSubmissionReceivedEmail(
  email: string,
  userName: string,
  resourceName: string
) {
  try {
    const settings = await getEmailSettings();
    if (!settings.emailSubmissionReceived) return;
    const { subject, html } = submissionReceivedContent(userName, resourceName);
    await getResend()?.emails.send({ from: FROM, to: email, subject, html });
    console.log(`[email] Submission received email sent to ${email}`);
  } catch (error) {
    console.error(
      `[email] Failed to send submission received email to ${email}:`,
      error
    );
  }
}

export async function sendSubmissionApprovedEmail(
  email: string,
  userName: string,
  resourceName: string,
  resourceSlug: string
) {
  try {
    const settings = await getEmailSettings();
    if (!settings.emailSubmissionApproved) return;
    const { subject, html } = submissionApprovedContent(
      userName,
      resourceName,
      resourceSlug
    );
    await getResend()?.emails.send({ from: FROM, to: email, subject, html });
    console.log(`[email] Submission approved email sent to ${email}`);
  } catch (error) {
    console.error(
      `[email] Failed to send submission approved email to ${email}:`,
      error
    );
  }
}

export async function sendSubmissionRejectedEmail(
  email: string,
  userName: string,
  resourceName: string
) {
  try {
    const settings = await getEmailSettings();
    if (!settings.emailSubmissionRejected) return;
    const { subject, html } = submissionRejectedContent(
      userName,
      resourceName
    );
    await getResend()?.emails.send({ from: FROM, to: email, subject, html });
    console.log(`[email] Submission rejected email sent to ${email}`);
  } catch (error) {
    console.error(
      `[email] Failed to send submission rejected email to ${email}:`,
      error
    );
  }
}

export async function sendAdminSubmissionAlert(
  resourceName: string,
  authorName: string
) {
  try {
    const settings = await getEmailSettings();
    if (!settings.emailAdminAlert) return;

    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, "admin"));

    if (admins.length === 0) return;

    const { subject, html } = adminSubmissionAlertContent(resourceName, authorName);
    const resend = getResend();
    if (!resend) return;

    await Promise.allSettled(
      admins.map((admin) =>
        resend.emails.send({ from: FROM, to: admin.email, subject, html })
      )
    );
    console.log(`[email] Admin submission alert sent to ${admins.length} admin(s)`);
  } catch (error) {
    console.error(`[email] Failed to send admin submission alert:`, error);
  }
}
