import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MAX_BODY_BYTES = 1024
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

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

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  const head = user.slice(0, 1)
  return `${head}${'*'.repeat(Math.max(user.length - 1, 1))}@${domain}`
}

async function persist(email: string): Promise<void> {
  const record = JSON.stringify({ email, receivedAt: new Date().toISOString() })
  if (process.env.NODE_ENV === 'production') {
    console.log(`[access] ${maskEmail(email)}`)
    return
  }
  const dir = path.join(process.cwd(), '.data')
  await fs.mkdir(dir, { recursive: true })
  await fs.appendFile(
    path.join(dir, 'access-requests.jsonl'),
    `${record}\n`,
    'utf8',
  )
}

function ok(): NextResponse {
  return NextResponse.json({ ok: true })
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

  const { email, company_website: honeypot } = body as Record<string, unknown>

  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return ok()
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 422 })
  }

  try {
    await persist((email as string).trim().toLowerCase())
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }

  return ok()
}
