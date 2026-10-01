import { Resend } from 'resend'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { confirmationEmail, notificationEmail, type Brand } from '@/lib/email-templates'

const FROM_ADDRESS = `${SITE_NAME} <no-reply@axonsecurity.tech>`
const BRAND: Brand = { name: SITE_NAME, siteUrl: SITE_URL }

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

  const message = notificationEmail(BRAND, { email: submittedEmail, ip, timestamp, note })
  const { error } = await client().emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: submittedEmail,
    ...message,
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
    ...confirmationEmail(BRAND),
  })

  if (error) {
    throw new EmailSendError(`Confirmation email failed: ${error.message}`)
  }
}
