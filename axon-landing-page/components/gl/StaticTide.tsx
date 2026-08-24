const STATIC_TIDE_STYLE = {
  background: [
    'radial-gradient(120% 60% at 50% 62%, rgba(149, 255, 42, 0.10) 0%, rgba(149, 255, 42, 0.03) 34%, transparent 60%)',
    'radial-gradient(140% 80% at 50% 100%, rgba(243, 242, 242, 0.07) 0%, transparent 55%)',
    'radial-gradient(circle at 25% 70%, rgba(243, 242, 242, 0.05) 0%, transparent 40%)',
    'radial-gradient(circle at 78% 66%, rgba(149, 255, 42, 0.06) 0%, transparent 38%)',
    'linear-gradient(180deg, #0b0c0a 0%, #0d0f0b 58%, #101309 100%)',
  ].join(', '),
}

export default function StaticTide() {
  return <div className="tide-static" style={STATIC_TIDE_STYLE} aria-hidden="true" />
}
