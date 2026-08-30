/*
 * Rasterizes the Sparkable mark (the same SVG path used by `src/view/icons/Logo.tsx`)
 * into the PNG assets Expo needs. Run with `node scripts/generateBrandIcons.mjs`.
 *
 * We have no native image toolchain (sharp/ImageMagick) in this repo, so this
 * does its own bezier flattening, scanline fill and PNG encoding. That keeps the
 * icons regenerable from the single source-of-truth path below.
 */
import {deflateSync} from 'node:zlib'
import {mkdirSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The Sparkable mark, in a 0 0 64 64 viewBox. Keep in sync with
 * `src/view/icons/Logo.tsx`, `src/Splash.tsx`, `src/Splash.web.tsx`,
 * `web/index.html` and `bskyweb/templates/base.html`.
 */
const LOGO_PATH =
  'M63 1C44 24 44 40 63 63C40 44 24 44 1 63C20 40 20 24 1 1C24 20 40 20 63 1Z'
const VIEWBOX = 64

const BRAND_BLUE = [0x41, 0x53, 0xf5]
const WHITE = [0xff, 0xff, 0xff]

/*
 * Minimal parser for the absolute "M x y C ... Z" subset we use. Returns a flat
 * list of points approximating the outline.
 */
function flattenPath(d, segmentsPerCurve = 96) {
  const nums = d.match(/-?\d*\.?\d+/g).map(Number)
  const commands = d.match(/[MCZ]/g)
  const points = []
  let i = 0
  let cursor = [0, 0]

  for (const command of commands) {
    if (command === 'M') {
      cursor = [nums[i++], nums[i++]]
      points.push(cursor)
    } else if (command === 'C') {
      const c1 = [nums[i++], nums[i++]]
      const c2 = [nums[i++], nums[i++]]
      const end = [nums[i++], nums[i++]]
      for (let s = 1; s <= segmentsPerCurve; s++) {
        const t = s / segmentsPerCurve
        const u = 1 - t
        points.push([
          u * u * u * cursor[0] +
            3 * u * u * t * c1[0] +
            3 * u * t * t * c2[0] +
            t * t * t * end[0],
          u * u * u * cursor[1] +
            3 * u * u * t * c1[1] +
            3 * u * t * t * c2[1] +
            t * t * t * end[1],
        ])
      }
      cursor = end
    }
  }
  return points
}

/**
 * Antialiased even-odd scanline fill. Returns per-pixel coverage in 0..1.
 */
function rasterize(points, size, subsamples = 5) {
  const coverage = new Float32Array(size * size)
  const edges = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    if (a[1] !== b[1]) edges.push([a, b])
  }

  const weight = 1 / subsamples
  const xs = []

  for (let y = 0; y < size; y++) {
    for (let s = 0; s < subsamples; s++) {
      const sy = y + (s + 0.5) / subsamples
      xs.length = 0
      for (const [a, b] of edges) {
        const [x0, y0] = a
        const [x1, y1] = b
        if (sy >= Math.min(y0, y1) && sy < Math.max(y0, y1)) {
          xs.push(x0 + ((sy - y0) / (y1 - y0)) * (x1 - x0))
        }
      }
      if (xs.length < 2) continue
      xs.sort((m, n) => m - n)

      for (let k = 0; k + 1 < xs.length; k += 2) {
        const spanStart = Math.max(0, xs[k])
        const spanEnd = Math.min(size, xs[k + 1])
        if (spanEnd <= spanStart) continue

        const first = Math.floor(spanStart)
        const last = Math.ceil(spanEnd) - 1
        for (let x = first; x <= last; x++) {
          // horizontal coverage of this pixel cell by the span
          const covered = Math.min(spanEnd, x + 1) - Math.max(spanStart, x)
          if (covered > 0) coverage[y * size + x] += covered * weight
        }
      }
    }
  }
  return coverage
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }

  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  const crc32 = buf => {
    let c = 0xffffffff
    for (const byte of buf) c = table[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type, data) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body))
    return Buffer.concat([length, body, crc])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * @param {object} options
 * @param {number} options.size Output width/height in pixels.
 * @param {number[]} options.fill Mark color as [r, g, b].
 * @param {number[]|null} options.background Opaque background as [r, g, b], or null for transparency.
 * @param {number} options.scale Fraction of the canvas the mark should occupy.
 */
function renderIcon({size, fill, background = null, scale = 1}) {
  const supersample = size < 128 ? 4 : 1
  const canvas = size * supersample
  const marked = canvas * scale
  const offset = (canvas - marked) / 2
  const points = flattenPath(LOGO_PATH).map(([x, y]) => [
    offset + (x / VIEWBOX) * marked,
    offset + (y / VIEWBOX) * marked,
  ])
  let coverage = rasterize(points, canvas)

  if (supersample > 1) {
    const reduced = new Float32Array(size * size)
    for (let y = 0; y < canvas; y++) {
      for (let x = 0; x < canvas; x++) {
        reduced[
          Math.floor(y / supersample) * size + Math.floor(x / supersample)
        ] += coverage[y * canvas + x] / (supersample * supersample)
      }
    }
    coverage = reduced
  }

  const rgba = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const alpha = Math.max(0, Math.min(1, coverage[i]))
    if (background) {
      rgba[i * 4] = Math.round(background[0] * (1 - alpha) + fill[0] * alpha)
      rgba[i * 4 + 1] = Math.round(
        background[1] * (1 - alpha) + fill[1] * alpha,
      )
      rgba[i * 4 + 2] = Math.round(
        background[2] * (1 - alpha) + fill[2] * alpha,
      )
      rgba[i * 4 + 3] = 255
    } else {
      rgba[i * 4] = fill[0]
      rgba[i * 4 + 1] = fill[1]
      rgba[i * 4 + 2] = fill[2]
      rgba[i * 4 + 3] = Math.round(alpha * 255)
    }
  }
  return encodePNG(size, size, rgba)
}

const TARGETS = [
  {path: 'assets/favicon.png', size: 64, fill: BRAND_BLUE, scale: 0.94},
  {path: 'assets/logo.png', size: 512, fill: BRAND_BLUE, scale: 0.94},
  {
    path: 'assets/app-icons/ios_icon_default_next.png',
    size: 1024,
    fill: BRAND_BLUE,
    background: WHITE,
    scale: 0.66,
  },
  {
    path: 'assets/app-icons/android_icon_default_next.png',
    size: 1024,
    fill: BRAND_BLUE,
    background: WHITE,
    scale: 0.66,
  },
  {
    path: 'assets/icon-android-foreground.png',
    size: 1024,
    fill: BRAND_BLUE,
    scale: 0.5,
  },
  {
    path: 'assets/icon-android-monochrome.png',
    size: 1024,
    fill: WHITE,
    scale: 0.5,
  },
  {
    path: 'assets/icon-android-notification.png',
    size: 96,
    fill: WHITE,
    scale: 0.86,
  },
  {
    path: 'bskyweb/static/favicon.png',
    size: 64,
    fill: BRAND_BLUE,
    scale: 0.94,
  },
  {
    path: 'bskyweb/static/favicon-16x16.png',
    size: 16,
    fill: BRAND_BLUE,
    scale: 1,
  },
  {
    path: 'bskyweb/static/favicon-32x32.png',
    size: 32,
    fill: BRAND_BLUE,
    scale: 0.96,
  },
  {
    path: 'bskyweb/static/apple-touch-icon.png',
    size: 180,
    fill: BRAND_BLUE,
    background: WHITE,
    scale: 0.66,
  },
]

for (const {path, ...options} of TARGETS) {
  const out = resolve(ROOT, path)
  mkdirSync(dirname(out), {recursive: true})
  writeFileSync(out, renderIcon(options))
  console.log(`wrote ${path}`)
}
