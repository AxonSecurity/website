import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import SmoothScroll from '@/components/motion/SmoothScroll'
import AmbientField from '@/components/canvas/AmbientField'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Axon — Know every model your company runs',
  description:
    'Axon is the AI security posture management platform for discovering, understanding, and governing every model your company runs.',
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
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="antialiased">
        <AmbientField />
        <SmoothScroll />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
