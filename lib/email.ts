import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { SITE_NAME } from '@/lib/site'

const FROM_ADDRESS = `${SITE_NAME} <no-reply@axonsecurity.tech>`

let _transporter: Transporter | null = null

function transporter(): Transporter {
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) !== 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return _transporter
}

/* ── Notification email (to you) ────────────────────────────────────────── */

export async function sendNotificationEmail(
  submittedEmail: string,
  ip: string,
): Promise<void> {
  const to = process.env.NOTIFICATION_TO
  if (!to) {
    console.error('[email] NOTIFICATION_TO is not set — skipping notification')
    return
  }

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  await transporter().sendMail({
    from: FROM_ADDRESS,
    to,
    replyTo: submittedEmail,
    subject: `New early-access request — ${submittedEmail}`,
    text: `New early-access request.\n\nEmail: ${submittedEmail}\nIP: ${ip}\nTime: ${timestamp}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0c0a;color:#f3f2f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;padding:0 24px;">
    <tr><td style="padding-bottom:24px;border-bottom:1px solid rgba(243,242,242,0.1);">
      <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#95ff2a;">${SITE_NAME} Early Access</span>
    </td></tr>
    <tr><td style="padding:32px 0 16px;">
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#f3f2f2;">New early-access request</h1>
    </td></tr>
    <tr><td style="padding-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(243,242,242,0.05);border-radius:8px;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(243,242,242,0.5);">Email</p>
          <p style="margin:0;font-size:16px;color:#f3f2f2;"><a href="mailto:${submittedEmail}" style="color:#95ff2a;text-decoration:none;">${submittedEmail}</a></p>
        </td></tr>
        <tr><td style="padding:0 20px;border-top:1px solid rgba(243,242,242,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:12px 0;width:50%;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(243,242,242,0.5);">IP</p>
              <p style="margin:0;font-size:13px;color:#f3f2f2;font-family:monospace;">${ip}</p>
            </td>
            <td style="padding:12px 0;width:50%;text-align:right;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(243,242,242,0.5);">Time</p>
              <p style="margin:0;font-size:13px;color:#f3f2f2;font-family:monospace;">${timestamp}</p>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding-top:16px;border-top:1px solid rgba(243,242,242,0.1);">
      <p style="margin:0;font-size:12px;color:rgba(243,242,242,0.35);">Reply to this email to respond directly to the requestor.</p>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

/* ── Confirmation email (to the submitter) ──────────────────────────────── */

export async function sendConfirmationEmail(
  submittedEmail: string,
): Promise<void> {
  await transporter().sendMail({
    from: FROM_ADDRESS,
    to: submittedEmail,
    subject: `You're on the ${SITE_NAME} waitlist`,
    text: `You're on the list.\n\nThanks for your interest in ${SITE_NAME}. We'll be in touch soon with your early-access details.\n\n— The ${SITE_NAME} Team`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0c0a;color:#f3f2f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;padding:0 24px;">
    <tr><td style="padding-bottom:24px;border-bottom:1px solid rgba(243,242,242,0.1);">
      <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#95ff2a;">${SITE_NAME}</span>
    </td></tr>
    <tr><td style="padding:40px 0 24px;">
      <h1 style="margin:0;font-size:24px;font-weight:600;color:#f3f2f2;line-height:1.3;">You&apos;re on the list.</h1>
    </td></tr>
    <tr><td style="padding-bottom:32px;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:rgba(243,242,242,0.85);">
        Thanks for your interest in ${SITE_NAME}. We&apos;re building something we think you&apos;ll want to see.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.7;color:rgba(243,242,242,0.85);">
        We&apos;ll reach out soon with your early-access details — including a guided teardown of your AI surface, founding-partner pricing, and a direct line to our engineering team.
      </p>
    </td></tr>
    <tr><td style="padding-top:24px;border-top:1px solid rgba(243,242,242,0.1);">
      <p style="margin:0;font-size:13px;color:rgba(243,242,242,0.4);">— The ${SITE_NAME} Team</p>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
