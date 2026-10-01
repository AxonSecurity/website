import Access from '@/components/sections/access/Access'
import Discover from '@/components/sections/discover/Discover'
import Hero from '@/components/sections/hero/Hero'
import Judge from '@/components/sections/judge/Judge'
import Manifesto from '@/components/sections/manifesto/Manifesto'
import Observe from '@/components/sections/observe/Observe'
import Partners from '@/components/sections/partners/Partners'
import Roadmap from '@/components/sections/roadmap/Roadmap'
import Sovereign from '@/components/sections/sovereign/Sovereign'
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
      memberOf: [
        {
          '@type': 'Organization',
          name: 'HackNation Venture Lab',
          url: 'https://ventures.hack-nation.ai/',
        },
        {
          '@type': 'Organization',
          name: 'AWS for Startups',
          url: 'https://aws.amazon.com/startups/',
        },
        {
          '@type': 'Organization',
          name: 'E2B for Startups',
          url: 'https://e2b.dev/startups/',
        },
        {
          '@type': 'Organization',
          name: 'Anthropic Cyber Verification Program',
          url: 'https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet',
        },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#service` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      name: SITE_NAME,
      serviceType: 'Agent security for AI stacks',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      provider: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <Nav />
      <main id="main">
        <Hero />
        <Partners />
        <Manifesto />
        <Discover />
        <Judge />
        <Observe />
        <Sovereign />
        <Roadmap />
        <Access />
      </main>
      <Footer />
    </>
  )
}
