import { Resend } from 'resend'
import { SITE_NAME } from '@/lib/site'

const FROM_ADDRESS = `${SITE_NAME} <no-reply@axonsecurity.tech>`

/* ── Light-theme email tokens ───────────────────────────────────────────── */

const BG = '#ffffff'
const INK = '#0b0c0a'
const GHOST = 'rgba(11,12,10,0.45)'
const FAINT = 'rgba(11,12,10,0.35)'
const HAIRLINE = 'rgba(11,12,10,0.1)'
const CARD_BG = 'rgba(11,12,10,0.04)'
const CARD_BORDER = 'rgba(11,12,10,0.08)'

/* ── Helpers ────────────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ── Error classes ──────────────────────────────────────────────────────── */

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailConfigError'
  }
}

export class EmailSendError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailSendError'
  }
}

/* ── Resend client (lazy singleton) ─────────────────────────────────────── */

let _client: Resend | null = null

function client(): Resend {
  if (_client) return _client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new EmailConfigError('Missing environment variable: RESEND_API_KEY')
  _client = new Resend(apiKey)
  return _client
}

/* ── Notification email (to you) ────────────────────────────────────────── */

export async function sendNotificationEmail(
  submittedEmail: string,
  ip: string,
  note?: string,
): Promise<void> {
  const to = process.env.NOTIFICATION_TO
  if (!to) throw new EmailConfigError('NOTIFICATION_TO is not set')

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const { error } = await client().emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: submittedEmail,
    subject: `New early-access request — ${submittedEmail}`,
    text: `New early-access request.\n\nEmail: ${submittedEmail}\nIP: ${ip}\nTime: ${timestamp}${note ? `\nNote: ${note}` : ''}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};color:${INK};font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;padding:0 24px;">
    <tr><td style="padding-bottom:24px;border-bottom:1px solid ${HAIRLINE};">
      <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#95ff2a;">${SITE_NAME} Early Access</span>
    </td></tr>
    <tr><td style="padding:32px 0 16px;">
      <h1 style="margin:0;font-size:22px;font-weight:600;color:${INK};">New early-access request</h1>
    </td></tr>
    <tr><td style="padding-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:8px;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${GHOST};">Email</p>
          <p style="margin:0;font-size:16px;color:${INK};"><a href="mailto:${submittedEmail}" style="color:#95ff2a;text-decoration:none;">${submittedEmail}</a></p>
        </td></tr>
        <tr><td style="padding:0 20px;border-top:1px solid ${CARD_BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:12px 0;width:50%;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${GHOST};">IP</p>
              <p style="margin:0;font-size:13px;color:${INK};font-family:monospace;">${ip}</p>
            </td>
            <td style="padding:12px 0;width:50%;text-align:right;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${GHOST};">Time</p>
              <p style="margin:0;font-size:13px;color:${INK};font-family:monospace;">${timestamp}</p>
            </td>
          </tr></table>
        </td></tr>
        ${note ? `<tr><td style="padding:12px 20px;border-top:1px solid ${CARD_BORDER};">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${GHOST};">Note</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">${escapeHtml(note)}</p>
        </td></tr>` : ''}
      </table>
    </td></tr>
    <tr><td style="padding-top:16px;border-top:1px solid ${HAIRLINE};">
      <p style="margin:0;font-size:12px;color:${FAINT};">Reply to this email to respond directly to the requestor.</p>
    </td></tr>
  </table>
</body>
</html>`,
  })

  if (error) {
    throw new EmailSendError(`Notification email failed: ${error.message}`)
  }
}

/* ── Confirmation email (to the submitter) ──────────────────────────────── */

export async function sendConfirmationEmail(
  submittedEmail: string,
): Promise<void> {
  const { error } = await client().emails.send({
    from: FROM_ADDRESS,
    to: submittedEmail,
    subject: `You're in — ${SITE_NAME} early access`,
    text: `You're in.\n\nThanks for your interest in ${SITE_NAME}. You're now on the early-access list.\n\nWe'll be in touch soon with next steps — including a direct line to our founding engineers.\n\n-The ${SITE_NAME} Team\n\n${SITE_NAME}\nContinuous AI posture & governance`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};color:${INK};font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;padding:0 24px;">
    <tr><td style="padding-bottom:24px;border-bottom:1px solid ${HAIRLINE};">
      <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#95ff2a;">${SITE_NAME}</span>
    </td></tr>
    <tr><td style="padding:40px 0 24px;">
      <h1 style="margin:0;font-size:24px;font-weight:600;color:${INK};line-height:1.3;">You&apos;re in.</h1>
    </td></tr>
    <tr><td style="padding-bottom:32px;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:rgba(11,12,10,0.75);">
        Thanks for your interest in ${SITE_NAME}. You&apos;re now on the early-access list.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.7;color:rgba(11,12,10,0.75);">
        We&apos;ll be in touch soon with next steps &mdash; including a direct line to our founding engineers.
      </p>
    </td></tr>
    <tr><td style="padding-top:24px;border-top:1px solid ${HAIRLINE};">
      <p style="margin:0 0 24px;font-size:14px;color:${GHOST};">-The ${SITE_NAME} Team</p>
      <p style="margin:0;font-size:12px;color:${FAINT};letter-spacing:0.04em;">Continuous AI posture &amp; governance</p>
    </td></tr>
  </table>
</body>
</html>`,
  })

  if (error) {
    throw new EmailSendError(`Confirmation email failed: ${error.message}`)
  }
}
