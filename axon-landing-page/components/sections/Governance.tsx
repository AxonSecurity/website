import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Parallax from '@/components/motion/Parallax'

export default function Governance() {
  return (
    <section className="governance" id="governance">
      <Parallax className="kinetic-word" factor={0.16}>
        GOVERNED
      </Parallax>
      <div className="shell governance-inner">
        <Reveal>
          <p className="eyebrow">Always-on intelligence</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            The model layer changes daily.
            <br />
            Your clarity doesn&apos;t have to.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={2}>
          <p className="body-copy">
            Axon continuously discovers, contextualizes, and prioritizes every
            exposure across your AI environment. <em>No blind spots.</em>{' '}
            <em>No alert fatigue.</em> Posture that holds while everything
            underneath it moves.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
