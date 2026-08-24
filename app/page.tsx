import AccessForm from '@/components/sections/AccessForm'
import Capabilities from '@/components/sections/Capabilities'
import Governance from '@/components/sections/Governance'
import Hero from '@/components/sections/Hero'
import Loop from '@/components/sections/Loop'
import Telemetry from '@/components/sections/Telemetry'
import Marquee from '@/components/motion/Marquee'
import Footer from '@/components/layout/Footer'
import Nav from '@/components/layout/Nav'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/axon-tile.png`,
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#software` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function Page() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Nav />
      <Hero />
      <Marquee />
      <Loop />
      <Telemetry />
      <Capabilities />
      <Governance />
      <AccessForm />
      <Footer />
    </main>
  )
}
