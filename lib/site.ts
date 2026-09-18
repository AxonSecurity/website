const isDev = process.env.NODE_ENV === 'development'

const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (isDev ? 'http://localhost:3000' : 'https://axonsecurity.tech')

export const SITE_URL = rawUrl.replace(/\/+$/, '')

export const SITE_NAME = 'Axon'

export const SITE_TITLE = 'Axon — Agent Security for the AI Stack You Run'

export const SITE_DESCRIPTION =
  'Axon maps your coding agents, MCP servers, and framework agents into one security graph of blast radius. Sovereign, framework-grounded, live on day one.'

export const SITE_LOCALE = 'en_US'
