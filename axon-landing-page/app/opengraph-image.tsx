import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Axon — Know every model your company runs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

let assetsPromise:
  | Promise<{ syne: ArrayBuffer; mark: string }>
  | null = null

async function loadAssets() {
  const fontsDir = path.join(process.cwd(), 'lib', 'fonts')
  const brandDir = path.join(process.cwd(), 'public', 'brand')
  const [syne, mark] = await Promise.all([
    readFile(path.join(fontsDir, 'Syne-Bold.ttf')),
    readFile(path.join(brandDir, 'axon-mark-lime.png')),
  ])
  return {
    syne: syne.buffer as ArrayBuffer,
    mark: `data:image/png;base64,${mark.toString('base64')}`,
  }
}

function getAssets() {
  if (!assetsPromise) assetsPromise = loadAssets()
  return assetsPromise
}

const GLOW = {
  position: 'absolute',
  display: 'flex',
} as const

export default async function OpengraphImage() {
  const { syne, mark } = await getAssets()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '68px 72px',
          background: '#0b0c0a',
          position: 'relative',
        }}
      >
        <div
          style={{
            ...GLOW,
            left: -280,
            top: -340,
            width: 920,
            height: 920,
            backgroundImage:
              'radial-gradient(circle at center, rgba(149,255,42,0.17) 0%, rgba(149,255,42,0) 68%)',
          }}
        />
        <div
          style={{
            ...GLOW,
            right: -360,
            bottom: -440,
            width: 1100,
            height: 1100,
            backgroundImage:
              'radial-gradient(circle at center, rgba(149,255,42,0.10) 0%, rgba(149,255,42,0) 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#95ff2a',
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontFamily: 'Syne',
          }}
        >
          AI SECURITY POSTURE MANAGEMENT
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 86,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.02,
            color: '#f3f2f2',
            maxWidth: 980,
            fontFamily: 'Syne',
          }}
        >
          Know every model your company runs.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              color: '#f3f2f2',
            }}
          >
            <img src={mark} width={54} height={54} alt="" />
            <span
              style={{
                fontFamily: 'Syne',
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              AXON
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              color: 'rgba(243,242,242,0.5)',
              fontSize: 19,
              letterSpacing: '0.08em',
            }}
          >
            SIGNAL IN. CLARITY OUT.
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Syne', data: syne, weight: 700 }] },
  )
}
