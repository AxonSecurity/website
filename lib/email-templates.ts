// Transactional email templates as plain functions with no imports, so they
// can be rendered and previewed outside Next. Table layout + inline styles
// for email clients; lime is only ever a brand accent, never text on white.

export interface RenderedEmail {
  subject: string
  text: string
  html: string
}

export interface Brand {
  name: string
  /** Absolute origin, no trailing slash. Used for the logo and footer link. */
  siteUrl: string
}

const COLOR = {
  page: '#f4f4f1',
  card: '#ffffff',
  ink: '#0b0c0a',
  body: '#3d3f3a',
  muted: '#7a7c76',
  hairline: '#e5e5e0',
  lime: '#95ff2a',
} as const

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Page, logo row, white card with a lime top rule, and a small footer. */
function layout(brand: Brand, title: string, card: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(title)}</title>
<style>
  @media (max-width: 480px) {
    .card-pad { padding: 32px 24px 28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLOR.page};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.page};">
  <tr>
    <td align="center" style="padding:40px 16px 48px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td style="padding:0 4px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="${brand.siteUrl}/brand/axon-tile.png" width="28" height="28" alt="" style="display:block;border:0;">
                </td>
                <td style="vertical-align:middle;padding-left:10px;font-family:${SANS};font-size:15px;font-weight:700;letter-spacing:0.08em;color:${COLOR.ink};">${escapeHtml(brand.name.toUpperCase())}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${COLOR.card};border:1px solid ${COLOR.hairline};border-radius:12px;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="height:4px;line-height:4px;font-size:0;background:${COLOR.lime};">&nbsp;</td></tr>
              <tr><td class="card-pad" style="padding:40px 40px 36px;font-family:${SANS};">${card}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 4px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${COLOR.muted};">${footer}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.01em;color:${COLOR.ink};">${text}</h1>`
}

function paragraph(html: string, spacing = 16): string {
  return `<p style="margin:0 0 ${spacing}px;font-size:16px;line-height:1.65;color:${COLOR.body};">${html}</p>`
}

/* ── Confirmation (to the person who asked for coverage) ───────────────── */

export function confirmationEmail(brand: Brand): RenderedEmail {
  const { name } = brand
  const subject = `You're in — ${name} coverage`
  const host = brand.siteUrl.replace(/^https?:\/\//, '')
  const card = [
    heading('You&rsquo;re in.'),
    paragraph(`Thanks for your interest in ${name}. You&rsquo;re now on the list for early access.`),
    paragraph('We&rsquo;ll be in touch soon with next steps &mdash; including a direct line to our founding engineers.', 28),
    `<p style="margin:0;font-size:16px;line-height:1.65;color:${COLOR.ink};">-The ${name} Team</p>`,
  ].join('\n')
  const footer = `<strong style="font-weight:600;color:${COLOR.body};">${name}</strong> &middot; Agent security for the AI stack you run<br><a href="${brand.siteUrl}" style="color:${COLOR.muted};text-decoration:underline;">${escapeHtml(host)}</a>`

  return {
    subject,
    text: `You're in.\n\nThanks for your interest in ${name}. You're now on the list for early access.\n\nWe'll be in touch soon with next steps — including a direct line to our founding engineers.\n\n-The ${name} Team\n\n${name}\nAgent security for the AI stack you run`,
    html: layout(brand, subject, card, footer),
  }
}

/* ── Notification (internal, to the team) ───────────────────────────────── */

export interface CoverageRequest {
  email: string
  ip: string
  /** Pre-formatted, e.g. "Oct 1, 2026, 09:30 PM UTC". */
  timestamp: string
  note?: string
}

function detailRow(label: string, valueHtml: string, mono = false): string {
  return `<tr>
  <td style="padding:12px 0;border-top:1px solid ${COLOR.hairline};width:96px;vertical-align:top;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.muted};">${label}</td>
  <td style="padding:12px 0;border-top:1px solid ${COLOR.hairline};vertical-align:top;font-size:${mono ? 13 : 15}px;line-height:1.55;color:${COLOR.ink};${mono ? `font-family:${MONO};` : ''}">${valueHtml}</td>
</tr>`
}

export function notificationEmail(brand: Brand, request: CoverageRequest): RenderedEmail {
  const email = escapeHtml(request.email)
  const rows = [
    detailRow('Email', `<a href="mailto:${email}" style="color:${COLOR.ink};text-decoration:underline;">${email}</a>`),
    detailRow('IP', escapeHtml(request.ip), true),
    detailRow('Time', escapeHtml(request.timestamp), true),
    request.note ? detailRow('Note', escapeHtml(request.note)) : '',
  ].join('\n')
  const card = `${heading('New coverage request')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${SANS};border-bottom:1px solid ${COLOR.hairline};">
${rows}
</table>`
  const footer = 'Reply to this email to respond directly to the requestor.'

  return {
    subject: `New coverage request — ${request.email}`,
    text: `New coverage request.\n\nEmail: ${request.email}\nIP: ${request.ip}\nTime: ${request.timestamp}${request.note ? `\nNote: ${request.note}` : ''}`,
    html: layout(brand, 'New coverage request', card, footer),
  }
}
