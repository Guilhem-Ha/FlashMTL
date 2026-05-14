/**
 * Junto — App Icon Generator
 *
 * Generates square icon assets using the 3-person huddle mark:
 *   assets/images/icon.png          1024×1024  cream bg  (iOS App Store)
 *   assets/images/adaptive-icon.png 1024×1024  amber bg  (Android adaptive)
 *   assets/images/splash-icon.png    512×512   cream bg  (splash)
 *
 * Usage:
 *   node scripts/generate-icon.js
 *
 * Requires: sharp (dev dependency)
 */
const sharp = require('sharp')
const path = require('path')

const ASSETS = path.join(__dirname, '..', 'assets', 'images')

// ── Brand tokens ───────────────────────────────────────────────
const INK   = '#1A1612'
const CREAM = '#F5F0E8'
const BRAND = '#FFBC58'   // brand amber — for adaptive icon

// ── Huddle mark SVG ────────────────────────────────────────────
// Original mark viewbox: roughly 0 0 64 56.
// We place it centered in a 1024×1024 canvas, scaled ×8 → 512×448px.
// Translate so the mark center (x=32) maps to canvas center (x=512):
//   tx = 512 - 32*8 = 256
// Vertical: mark bbox ~y 7→56, center y≈31.5. Map to canvas center y=512:
//   ty = 512 - 31.5*8 = 260  (rounds to 260 — slightly above mid, looks better)
function huddleMark(fill) {
  return `
    <g transform="translate(256,260) scale(8)">
      <circle cx="32" cy="14" r="7"  fill="${fill}"/>
      <circle cx="16" cy="22" r="6"  fill="${fill}"/>
      <circle cx="48" cy="22" r="6"  fill="${fill}"/>
      <path
        d="M6 50 C 6 38, 18 32, 32 32 C 46 32, 58 38, 58 50 L 58 52 C 50 55, 42 56, 32 56 C 22 56, 14 55, 6 52 Z"
        fill="${fill}"
      />
    </g>`
}

// ── SVG builders ───────────────────────────────────────────────
function iconSvg(size, bg, markFill) {
  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
         xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${bg}"/>
      ${
        size === 1024
          ? huddleMark(markFill)
          : /* 512: scale 4x, translate 128,130 */
            `<g transform="translate(128,130) scale(4)">
               <circle cx="32" cy="14" r="7"  fill="${markFill}"/>
               <circle cx="16" cy="22" r="6"  fill="${markFill}"/>
               <circle cx="48" cy="22" r="6"  fill="${markFill}"/>
               <path d="M6 50 C 6 38, 18 32, 32 32 C 46 32, 58 38, 58 50 L 58 52 C 50 55, 42 56, 32 56 C 22 56, 14 55, 6 52 Z" fill="${markFill}"/>
             </g>`
      }
    </svg>
  `)
}

// ── Generate ───────────────────────────────────────────────────
async function generate() {
  const jobs = [
    {
      file: 'icon.png',
      size: 1024,
      bg: CREAM,
      mark: INK,
      desc: 'iOS App Store icon (cream)',
    },
    {
      file: 'adaptive-icon.png',
      size: 1024,
      bg: BRAND,
      mark: INK,
      desc: 'Android adaptive icon (amber)',
    },
    {
      file: 'splash-icon.png',
      size: 512,
      bg: CREAM,
      mark: INK,
      desc: 'Splash screen icon (cream)',
    },
  ]

  for (const { file, size, bg, mark, desc } of jobs) {
    const svg = iconSvg(size, bg, mark)
    const out = path.join(ASSETS, file)
    await sharp(svg)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(out)
    console.log(`✓  ${desc}  →  ${file}  (${size}×${size})`)
  }

  console.log('\nDone. Update app.json if needed:')
  console.log('  "icon":         "./assets/images/icon.png"')
  console.log('  "adaptiveIcon": { "foregroundImage": "./assets/images/adaptive-icon.png", "backgroundColor": "#FFBC58" }')
  console.log('  "splash":       { "image": "./assets/images/splash-icon.png", "backgroundColor": "#F5F0E8" }')
}

generate().catch(err => { console.error(err); process.exit(1) })
