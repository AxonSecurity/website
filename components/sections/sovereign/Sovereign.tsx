import SectionHead from '@/components/ui/SectionHead'
import SovereignWord from './SovereignWord'
import TenantStage from './TenantStage'
import SovereignFacts from './SovereignFacts'
import './sovereign.css'

export default function Sovereign() {
  return (
    <section className="sov section" id="sovereign" data-chapter="Sovereign">
      <SovereignWord />
      <div className="wrap sov-inner">
        <SectionHead
          index="05"
          label="Sovereign"
          title={
            <>
              Your data never leaves <span className="serif-i lime">your tenant.</span>
            </>
          }
          lead="Axon runs inside your environment. Collectors are read-only, and only identifiers, hashes, counts and timestamps ever reach its store."
        />
        <TenantStage />
        <SovereignFacts />
      </div>
    </section>
  )
}
