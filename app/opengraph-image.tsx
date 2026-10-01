import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Axon — Agent security for the AI stack you already run'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#0b0c0a'
const PAPER = '#f3f2f2'
const LIME = '#95ff2a'

// Static WOFF cuts of the site's type (satori can't read woff2 or variable
// axes): Mona Sans 800 at wdth 112, Instrument Serif italic, Geist Mono 500.
interface Assets {
  display: ArrayBuffer
  serif: ArrayBuffer
  mono: ArrayBuffer
  mark: string
}

let assetsPromise: Promise<Assets> | null = null

async function loadAssets(): Promise<Assets> {
  const fontsDir = path.join(process.cwd(), 'lib', 'fonts')
  const brandDir = path.join(process.cwd(), 'public', 'brand')
  const [display, serif, mono, mark] = await Promise.all([
    readFile(path.join(fontsDir, 'MonaSans-ExtraBold-Wide.woff')),
    readFile(path.join(fontsDir, 'InstrumentSerif-Italic.woff')),
    readFile(path.join(fontsDir, 'GeistMono-Medium.woff')),
    readFile(path.join(brandDir, 'axon-mark-lime.png')),
  ])
  const buffer = (data: Buffer) => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  return {
    display: buffer(display),
    serif: buffer(serif),
    mono: buffer(mono),
    mark: `data:image/png;base64,${mark.toString('base64')}`,
  }
}

function getAssets() {
  if (!assetsPromise) assetsPromise = loadAssets()
  return assetsPromise
}

const MONO = {
  fontFamily: 'Geist Mono',
  fontSize: 17,
  letterSpacing: '0.16em',
} as const

const LINE = {
  display: 'flex',
  alignItems: 'baseline',
} as const

export default async function OpengraphImage() {
  const { display, serif, mono, mark } = await getAssets()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px 58px',
          background: INK,
          position: 'relative',
          color: PAPER,
        }}
      >
        {/* Blueprint columns, as on the site. */}
        {/* satori ignores the `inset` shorthand; size absolutes explicitly. */}
        <div
          style={{
            position: 'absolute',
            left: 72,
            top: 0,
            width: size.width - 144,
            height: size.height,
            display: 'flex',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((column) => (
            <div
              key={column}
              style={{
                flex: 1,
                borderLeft: '1px solid rgba(243,242,242,0.06)',
                borderRight: column === 5 ? '1px solid rgba(243,242,242,0.06)' : 'none',
              }}
            />
          ))}
        </div>
        <div
          style={{
            // Kept inside the canvas: satori clips gradients on boxes that
            // overflow it.
            position: 'absolute',
            left: 0,
            top: 0,
            width: size.width,
            height: size.height,
            display: 'flex',
            backgroundImage:
              'radial-gradient(circle at 82% 18%, rgba(149,255,42,0.14) 0%, rgba(149,255,42,0.05) 28%, rgba(149,255,42,0) 52%)',
          }}
        />

        <div style={{ ...MONO, display: 'flex', alignItems: 'center', gap: 18, color: 'rgba(243,242,242,0.62)' }}>
          <div style={{ width: 46, height: 1, background: 'rgba(243,242,242,0.4)' }} />
          AGENT SECURITY · IN-TENANT
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Mona Sans',
            fontSize: 96,
            lineHeight: 0.98,
            letterSpacing: -4,
          }}
        >
          <div style={LINE}>Agent security</div>
          <div style={LINE}>for the AI stack</div>
          <div style={LINE}>
            you
            <span
              style={{
                fontFamily: 'Instrument Serif',
                fontStyle: 'italic',
                fontSize: 108,
                letterSpacing: -2,
                color: LIME,
                margin: '0 18px 0 24px',
              }}
            >
              already
            </span>
            run.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: 26,
            borderTop: '1px solid rgba(243,242,242,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={mark} width={46} height={46} alt="" />
            <span style={{ fontFamily: 'Mona Sans', fontSize: 32, letterSpacing: 1 }}>AXON</span>
          </div>
          <div style={{ ...MONO, display: 'flex', color: 'rgba(243,242,242,0.5)' }}>
            EVERY AGENT, ACCOUNTED FOR.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Mona Sans', data: display, weight: 800, style: 'normal' },
        { name: 'Instrument Serif', data: serif, weight: 400, style: 'italic' },
        { name: 'Geist Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  )
}
