const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://axon.example.com'

export const SITE_URL = rawUrl.replace(/\/+$/, '')

export const SITE_NAME = 'Axon'

export const SITE_TITLE = 'Axon — AI Security Posture Management'

export const SITE_DESCRIPTION =
  'Continuous AI posture & governance for security teams. Discover, understand, and govern every AI model, vendor, and dependency your company runs.'

export const SITE_LOCALE = 'en_US'
