import { NextResponse } from 'next/server'
import {
  sendNotificationEmail,
  sendConfirmationEmail,
  EmailConfigError,
  EmailSendError,
} from '@/lib/email'

export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MAX_BODY_BYTES = 1024
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const MIN_SUBMISSION_MS = 2_000

const hits = new Map<string, number[]>()

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  return forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 10_000) hits.clear()
  return false
}

function isValidEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(value)
  )
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) return true

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: token, remoteip: ip }),
  })

  const data = (await res.json()) as { success?: boolean }
  return data.success === true
}

export async function POST(request: Request): Promise<NextResponse> {
  const key = clientKey(request)

  if (isRateLimited(key)) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '600' } },
    )
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const { email, company_website: honeypot, turnstileToken, ts: clientTimestamp } =
    body as Record<string, unknown>

  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true })
  }

  if (turnstileToken && typeof turnstileToken === 'string') {
    const valid = await verifyTurnstile(turnstileToken, key)
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 403 })
    }
  }

  if (typeof clientTimestamp === 'number') {
    if (Date.now() - clientTimestamp < MIN_SUBMISSION_MS) {
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
    }
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 422 })
  }

  const cookies = request.headers.get('cookie') ?? ''
  const alreadySubmitted = cookies.split(';').some((c) => c.trim().startsWith('_ax='))
  if (alreadySubmitted) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const normalised = (email as string).trim().toLowerCase()

  try {
    await sendNotificationEmail(normalised, key)
    await sendConfirmationEmail(normalised)
  } catch (err) {
    if (err instanceof EmailConfigError) {
      console.error('[access] email config error:', err.message)
      return NextResponse.json(
        { ok: false, error: 'email_not_configured' },
        { status: 503 },
      )
    }
    console.error('[access] email send error:', err)
    return NextResponse.json(
      { ok: false, error: 'email_failed' },
      { status: 502 },
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('_ax', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 86_400,
    path: '/',
  })
  return response
}
