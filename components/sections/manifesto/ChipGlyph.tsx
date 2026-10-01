export type ChipKind = 'key' | 'tool' | 'data' | 'delegate'

// 24×24 line glyphs for the manifesto chips. Stroke only, currentColor.
const PATHS: Record<ChipKind, string> = {
  key: 'M7 16.5a4.5 4.5 0 1 1 0-9a4.5 4.5 0 1 1 0 9Z M11.5 12H22 M19 12V15.5 M16 12V14.5',
  tool: 'M3.5 5.5H20.5V18.5H3.5Z M7 10L9.5 12.5L7 15 M12 15H16.5',
  data: 'M5 6.5C5 4.5 19 4.5 19 6.5C19 8.5 5 8.5 5 6.5Z M5 6.5V17.5C5 19.5 19 19.5 19 17.5V6.5 M5 12C5 14 19 14 19 12',
  delegate: 'M5.5 9a2.5 2.5 0 1 1 0-5a2.5 2.5 0 1 1 0 5Z M18.5 20a2.5 2.5 0 1 1 0-5a2.5 2.5 0 1 1 0 5Z M8 6.5H13.5C16 6.5 18.5 8.5 18.5 11.5V15 M16 12.5L18.5 15L21 12.5',
}

export default function ChipGlyph({ kind }: { kind: ChipKind }) {
  return (
    <svg
      className={`pchip-glyph pchip-glyph-${kind}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={PATHS[kind]}
        stroke="currentColor"
        strokeWidth={kind === 'key' ? 1.6 : 1.8}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}
