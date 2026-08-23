import Logo from '@/components/brand/Logo'

export default function Footer() {
  return (
    <footer className="footer section-shell">
      <a href="#top" aria-label="Axon home">
        <Logo compact />
      </a>
      <span>© 2026 Axon Security, Inc.</span>
      <a href="#access">Contact</a>
    </footer>
  )
}
