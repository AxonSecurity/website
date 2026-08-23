import ParticleConstellation from '@/components/canvas/ParticleConstellation'
import PillButton from '@/components/layout/PillButton'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'
import { ArrowDownRight, ArrowRight } from '@/components/icons'
import BodyText from '@/components/typography/BodyText'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Eyebrow from '@/components/typography/Eyebrow'

export default function Hero() {
  return (
    <section className="hero section-shell" id="top">
      <div className="hero-inner">
        <div className="hero-copy">
          <Reveal>
            <Eyebrow>AI security posture management</Eyebrow>
          </Reveal>
          <Reveal delay={1}>
            <DisplayHeading as="h1" wordReveal>
              Know every model your company runs.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={2}>
            <BodyText>
              Axon gives security teams the living intelligence to understand,
              govern, and protect the AI systems shaping what&apos;s next.
            </BodyText>
          </Reveal>
          <Reveal delay={3}>
            <Magnetic>
              <PillButton href="#access">
                Request early access <ArrowRight size={16} />
              </PillButton>
            </Magnetic>
          </Reveal>
        </div>
        <div className="constellation-stage" aria-hidden="true">
          <ParticleConstellation />
        </div>
      </div>
      <Reveal className="hero-index">
        SCROLL TO EXPLORE <ArrowDownRight size={17} />
      </Reveal>
    </section>
  )
}
