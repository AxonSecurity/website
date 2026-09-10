const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://axon.example.com'

export const SITE_URL = rawUrl.replace(/\/+$/, '')

export const SITE_NAME = 'Axon'

export const SITE_TITLE = 'Axon — Managed AI Security'

export const SITE_DESCRIPTION =
  'Managed AI security, end to end. We discover, govern, and defend every model, vendor, and dependency your company runs — no security team required.'

export const SITE_LOCALE = 'en_US'
