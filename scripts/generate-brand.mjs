import { execFile } from 'node:child_process'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'public')
const TMP = path.join(ROOT, '.brand-tmp')

const MARK_PATH = 'M14 80 L50 20 L86 80 M31 58 H43 M57 58 H69'
const INK = '#0b0c0a'
const LIME = '#95ff2a'

function tileSvg(bg, stroke, strokeScale = 1) {
  const pad = 26
  const inner = 100 - pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${bg}"/>
  <g transform="translate(${pad} ${pad}) scale(${inner / 100})">
    <path d="${MARK_PATH}" fill="none" stroke="${stroke}" stroke-width="${11 * strokeScale}" stroke-linecap="square"/>
  </g>
</svg>`
}

function markSvg(stroke) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="${MARK_PATH}" fill="none" stroke="${stroke}" stroke-width="11" stroke-linecap="square"/>
</svg>`
}

const ASSETS = [
  { file: 'icon-dark-32x32.png', svg: tileSvg(LIME, INK), size: 32 },
  { file: 'icon-light-32x32.png', svg: tileSvg(INK, LIME), size: 32 },
  { file: 'apple-icon.png', svg: tileSvg(LIME, INK), size: 180 },
  { file: 'brand/axon-tile.png', svg: tileSvg(LIME, INK), size: 512 },
  { file: 'brand/axon-tile-inverse.png', svg: tileSvg(INK, LIME), size: 512 },
  { file: 'brand/axon-mark-lime.png', svg: markSvg(LIME), size: 480 },
]

async function render(asset) {
  const svgPath = path.join(TMP, `${asset.file.replace(/\//g, '_')}.svg`)
  await writeFile(svgPath, asset.svg, 'utf8')
  const outPath = path.join(PUBLIC, asset.file)
  await mkdir(path.dirname(outPath), { recursive: true })
  await new Promise((resolve, reject) => {
    execFile(
      'rsvg-convert',
      ['-w', String(asset.size), '-h', String(asset.size), '-o', outPath, svgPath],
      (error) => (error ? reject(error) : resolve()),
    )
  })
}

await rm(TMP, { recursive: true, force: true })
await mkdir(TMP, { recursive: true })

for (const asset of ASSETS) {
  await render(asset)
  console.log(`✓ ${asset.file} (${asset.size}px)`)
}

await rm(TMP, { recursive: true, force: true })
