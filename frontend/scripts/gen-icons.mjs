/**
 * Generates minimal valid PNG icons for the PWA manifest.
 * Run once: node scripts/gen-icons.mjs
 */
import zlib from "zlib"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, "../public")

// CRC32 table
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii")
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcVal = Buffer.alloc(4)
  crcVal.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcVal])
}

/**
 * Draws a rounded-rectangle icon with the same design as icon.svg.
 * Background: #1a1a2e, "lines" in #e2e8f0 and #94a3b8.
 */
function createPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // Helper: scale a 512-based value to current size
  const s = (v) => Math.round((v / 512) * size)
  const radius = s(96)

  // RGBA pixel buffer
  const pixels = new Uint8Array(size * size * 4)

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 4
    pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a
  }

  function fillRect(x1, y1, w, h, r, g, b) {
    for (let y = y1; y < y1 + h; y++)
      for (let x = x1; x < x1 + w; x++)
        setPixel(x, y, r, g, b)
  }

  // Draw rounded rectangle background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = false
      if (x >= radius && x < size - radius) {
        inside = y >= 0 && y < size
      } else if (y >= radius && y < size - radius) {
        inside = true
      } else {
        const cx = x < radius ? radius : size - 1 - radius
        const cy = y < radius ? radius : size - 1 - radius
        const dx = x - cx, dy = y - cy
        inside = dx * dx + dy * dy <= radius * radius
      }
      if (inside) setPixel(x, y, 0x1a, 0x1a, 0x2e)
    }
  }

  // Draw "lines" – title bar and content lines
  const lines = [
    // [x, y, w, h, isTitle]
    [s(120), s(130), s(200), s(24), true],
    [s(120), s(180), s(272), s(16), false],
    [s(120), s(212), s(240), s(16), false],
    [s(120), s(244), s(260), s(16), false],
    [s(120), s(310), s(200), s(20), true],
    [s(120), s(346), s(272), s(14), false],
    [s(120), s(374), s(220), s(14), false],
  ]

  for (const [x, y, w, h, isTitle] of lines) {
    const lh = Math.max(h, 1)
    const rr = Math.round(lh / 2)
    for (let ly = y; ly < y + lh; ly++) {
      for (let lx = x; lx < x + w; lx++) {
        const inCornerL = lx - x < rr
        const inCornerR = lx - x >= w - rr
        if (inCornerL || inCornerR) {
          const cx = inCornerL ? x + rr : x + w - rr - 1
          const dx = lx - cx, dy = ly - (y + lh / 2)
          if (dx * dx + dy * dy > rr * rr) continue
        }
        if (isTitle) setPixel(lx, ly, 0xe2, 0xe8, 0xf0)
        else setPixel(lx, ly, 0x94, 0xa3, 0xb8)
      }
    }
  }

  // Build raw scanlines (filter byte 0 per row)
  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      const dst = y * (1 + size * 4) + 1 + x * 4
      raw[dst] = pixels[src]
      raw[dst + 1] = pixels[src + 1]
      raw[dst + 2] = pixels[src + 2]
      raw[dst + 3] = pixels[src + 3]
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

fs.writeFileSync(path.join(outDir, "icon-192.png"), createPNG(192))
fs.writeFileSync(path.join(outDir, "icon-512.png"), createPNG(512))
console.log("Generated public/icon-192.png and public/icon-512.png")
