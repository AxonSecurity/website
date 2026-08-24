const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://axon.example.com'

export const SITE_URL = rawUrl.replace(/\/+$/, '')

export const SITE_NAME = 'Axon'

export const SITE_TITLE = 'Axon — Know every model your company runs'

export const SITE_DESCRIPTION =
  'Axon is the AI security posture management platform for discovering, understanding, and governing every model your company runs.'

export const SITE_LOCALE = 'en_US'
