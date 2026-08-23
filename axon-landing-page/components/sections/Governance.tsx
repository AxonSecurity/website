import Reveal from '@/components/Reveal'
import BodyText from '@/components/typography/BodyText'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Eyebrow from '@/components/typography/Eyebrow'

export default function Governance() {
  return (
    <section className="governance section-shell" id="governance">
      <Reveal>
        <Eyebrow>Always-on intelligence</Eyebrow>
        <DisplayHeading secondary>
          The map changes.
          <br />
          Your clarity doesn&apos;t.
        </DisplayHeading>
        <BodyText>
          Axon continuously discovers, contextualizes, and prioritizes every
          exposure across your AI environment. No blind spots. No alert
          fatigue.
        </BodyText>
      </Reveal>
    </section>
  )
}
