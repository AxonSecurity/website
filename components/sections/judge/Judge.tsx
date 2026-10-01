import SectionHead from '@/components/ui/SectionHead'
import ThreeLegs from '@/components/sections/judge/ThreeLegs'
import './judge.css'

export default function Judge() {
  return (
    <section id="judge" data-chapter="Judge" className="judge">
      <div className="wrap judge-head">
        <SectionHead
          index="03"
          label="Judge"
          title={
            <>
              Three legs. <span className="serif-i lime">Or it isn&apos;t a finding.</span>
            </>
          }
          lead="Axon raises a finding only when three things hold at once. Everything else is noise — and noise is where real risk hides."
        />
      </div>

      <ThreeLegs />
    </section>
  )
}
