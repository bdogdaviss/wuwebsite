// Generate placeholder icons for the extension
// Run with: node scripts/generate-icons.js

const fs = require('fs')
const path = require('path')

// Minimal PNG generator - creates a solid color square
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // CRC32 lookup table
  const crcTable = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    crcTable[n] = c
  }

  function crc32(data) {
    let crc = 0xffffffff
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  function createChunk(type, data) {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length, 0)
    const typeBuffer = Buffer.from(type)
    const crcData = Buffer.concat([typeBuffer, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(crcData), 0)
    return Buffer.concat([length, typeBuffer, data, crc])
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type (RGB)
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  // IDAT chunk - uncompressed image data
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b)
    }
  }

  // Deflate with no compression (store)
  const raw = Buffer.from(rawData)
  const blocks = []
  const blockSize = 65535
  for (let i = 0; i < raw.length; i += blockSize) {
    const block = raw.slice(i, Math.min(i + blockSize, raw.length))
    const isLast = i + blockSize >= raw.length
    const header = Buffer.alloc(5)
    header[0] = isLast ? 1 : 0
    header.writeUInt16LE(block.length, 1)
    header.writeUInt16LE(block.length ^ 0xffff, 3)
    blocks.push(header, block)
  }

  // Zlib header + data + adler32
  const zlibHeader = Buffer.from([0x78, 0x01])
  const deflateData = Buffer.concat(blocks)

  // Adler32
  let a = 1, b2 = 0
  for (let i = 0; i < raw.length; i++) {
    a = (a + raw[i]) % 65521
    b2 = (b2 + a) % 65521
  }
  const adler = Buffer.alloc(4)
  adler.writeUInt32BE((b2 << 16) | a, 0)

  const idat = Buffer.concat([zlibHeader, deflateData, adler])

  // IEND chunk
  const iend = Buffer.alloc(0)

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', idat),
    createChunk('IEND', iend),
  ])
}

const publicDir = path.join(__dirname, '..', 'public')

// WakeUp brand blue color
const blue = { r: 37, g: 99, b: 235 } // #2563eb

const sizes = [16, 48, 128]
sizes.forEach((size) => {
  const png = createPNG(size, size, blue.r, blue.g, blue.b)
  const filename = path.join(publicDir, `icon${size}.png`)
  fs.writeFileSync(filename, png)
  console.log(`Created ${filename}`)
})

console.log('Icons generated successfully!')
