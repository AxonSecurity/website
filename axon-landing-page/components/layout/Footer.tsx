import { AxonMark } from '@/components/icons'

export default function Footer() {
  return (
    <footer className="footer section-shell">
      <a href="#top">
        <span className="brand brand-compact" aria-label="Axon home">
          <AxonMark />
          <span>AXON</span>
        </span>
      </a>
      <span>© 2026 Axon Security, Inc.</span>
      <a href="#access">Contact</a>
    </footer>
  )
}
