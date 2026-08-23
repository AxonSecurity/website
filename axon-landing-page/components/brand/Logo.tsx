interface LogoProps {
  compact?: boolean
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <img
      className={compact ? 'logo logo-compact' : 'logo'}
      src="/brand/axon-lockup.png"
      alt="Axon"
      width={333}
      height={72}
    />
  )
}
