import Eyebrow from '@/components/ui/Eyebrow'
import SplitReveal from '@/components/motion/SplitReveal'
import AccessPoints from './AccessPoints'
import AccessForm from './AccessForm'
import './access.css'

export default function Access() {
  return (
    <section className="acc" id="access" data-chapter="Get covered">
      <div className="wrap acc-body">
        <Eyebrow index="07" label="Get covered" />
        <SplitReveal as="h2" type="chars" className="acc-title d-mega" stagger={0.03} duration={1.3}>
          Get <span className="serif-i lime">covered.</span>
        </SplitReveal>
        <div className="acc-grid">
          <AccessPoints />
          <AccessForm />
        </div>
      </div>
    </section>
  )
}
