import AccessForm from '@/components/sections/AccessForm'
import FeatureFlow from '@/components/sections/FeatureFlow'
import Governance from '@/components/sections/Governance'
import Hero from '@/components/sections/Hero'
import MetricsStrip from '@/components/sections/MetricsStrip'
import Marquee from '@/components/motion/Marquee'
import Process from '@/components/sections/Process'
import Footer from '@/components/layout/Footer'
import Nav from '@/components/layout/Nav'

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <MetricsStrip />
      <Marquee />
      <FeatureFlow />
      <Governance />
      <Process />
      <AccessForm />
      <Footer />
    </main>
  )
}
