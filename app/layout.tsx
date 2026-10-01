import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Geist_Mono, Instrument_Serif, Mona_Sans } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import SmoothScroll from '@/components/motion/SmoothScroll'
import Cursor from '@/components/motion/Cursor'
import Preloader from '@/components/motion/Preloader'
import { INTRO_GATE_SCRIPT } from '@/lib/intro-gate'
import Atmosphere from '@/components/layout/Atmosphere'
import ChapterRail from '@/components/layout/ChapterRail'
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site'
import './globals.css'

// Mona Sans carries the variable width axis the kinetic type rides on.
const mona = Mona_Sans({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-mona',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0c0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the intro gate script may add a class to
    // <html> before React hydrates.
    <html
      lang="en"
      className={`${mona.variable} ${geistMono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: browser extensions inject attributes
          onto <body> before hydration (e.g. data-atm-ext-installed). */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
        <noscript>
          <style>{'.preloader{display:none!important}'}</style>
        </noscript>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Atmosphere />
        <SmoothScroll />
        <Preloader />
        <Cursor />
        {children}
        <ChapterRail />
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
