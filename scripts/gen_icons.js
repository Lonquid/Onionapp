// Minimal PNG encoder (no deps) to produce launcher icon raster fallbacks.
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaPixels) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // raw scanlines with filter byte 0 prefix per row
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgbaPixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Draw the icon: background + 3 nested squares (layers motif), matching the vector icon.
function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const bg = [0x15, 0x13, 0x1a, 255];
  const layer1 = [0x2c, 0x28, 0x40, 255]; // outer shadow card
  const layer2 = [0xff, 0x6f, 0x3c, 255]; // orange card
  const layer3 = [0xff, 0xd2, 0x3f, 255]; // yellow card
  const layer4 = [0x15, 0x13, 0x1a, 255]; // center cut-out

  const s = size / 108;
  function rectFor(x0, y0, x1, y1, color) {
    const X0 = Math.round(x0 * s), Y0 = Math.round(y0 * s);
    const X1 = Math.round(x1 * s), Y1 = Math.round(y1 * s);
    for (let y = Y0; y < Y1; y++) {
      for (let x = X0; x < X1; x++) {
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const idx = (y * size + x) * 4;
        buf[idx] = color[0]; buf[idx + 1] = color[1]; buf[idx + 2] = color[2]; buf[idx + 3] = color[3];
      }
    }
  }

  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = bg[0]; buf[i + 1] = bg[1]; buf[i + 2] = bg[2]; buf[i + 3] = bg[3];
  }
  rectFor(30, 30, 78, 78, layer1);
  rectFor(24, 24, 72, 72, layer2);
  rectFor(38, 38, 66, 66, layer3);
  rectFor(44, 44, 60, 60, layer4);

  return buf;
}

const densities = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
};

const resRoot = process.argv[2];
for (const [dir, size] of Object.entries(densities)) {
  const outDir = path.join(resRoot, dir);
  fs.mkdirSync(outDir, { recursive: true });
  const pixels = drawIcon(size);
  const png = encodePNG(size, size, pixels);
  fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), png);
  fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), png);
  console.log('wrote', dir, size);
}
