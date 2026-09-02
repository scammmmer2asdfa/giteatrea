// Generates every icon Tauri needs from one procedural drawing, so the source of
// truth is this file rather than a set of opaque binaries.
// Run: node apps/desktop/scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src-tauri', 'icons');

const GROUND = [0x2b, 0x2d, 0x30];
const STRUCTURE = [0x4a, 0x90, 0xc4];
const SIGNAL = [0x8f, 0xa8, 0x90];
const INK = [0xed, 0xed, 0xea];

/** The app mark: a sheet neatline enclosing four parcels, one of them "recent". */
function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };
  const rect = (x0, y0, x1, y1, color) => {
    for (let y = Math.round(y0); y < Math.round(y1); y++) {
      for (let x = Math.round(x0); x < Math.round(x1); x++) set(x, y, color);
    }
  };
  const frame = (x0, y0, x1, y1, w, color) => {
    rect(x0, y0, x1, y0 + w, color);
    rect(x0, y1 - w, x1, y1, color);
    rect(x0, y0, x0 + w, y1, color);
    rect(x1 - w, y0, x1, y1, color);
  };

  const s = size;
  const u = s / 32;
  const line = Math.max(1, Math.round(u));

  rect(0, 0, s, s, GROUND);
  frame(2 * u, 2 * u, s - 2 * u, s - 2 * u, line, STRUCTURE);
  frame(3.5 * u, 3.5 * u, s - 3.5 * u, s - 3.5 * u, line, STRUCTURE);

  // Parcels sized unevenly, the way a treemap divides by weight.
  const i0 = 5.5 * u;
  const i1 = s - 5.5 * u;
  const midX = i0 + (i1 - i0) * 0.58;
  const midY = i0 + (i1 - i0) * 0.62;
  const gap = Math.max(1, Math.round(u * 0.6));

  rect(i0, i0, midX - gap, midY - gap, INK);
  rect(midX, i0, i1, midY * 0.72, STRUCTURE);
  rect(midX, midY * 0.72 + gap, i1, midY - gap, INK);
  rect(i0, midY, midX * 0.78, i1, INK);
  rect(midX * 0.78 + gap, midY, i1, i1, SIGNAL); // the one recent parcel

  return px;
}

function png(size) {
  const raw = draw(size);
  const stride = size * 4;
  const filtered = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    filtered[y * (stride + 1)] = 0;
    raw.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(filtered, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

/** Vista-era ICO, which may embed PNG payloads directly. */
function ico(sizes) {
  const images = sizes.map((s) => ({ size: s, data: png(s) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const img of images) {
    const e = Buffer.alloc(16);
    e[0] = img.size >= 256 ? 0 : img.size;
    e[1] = img.size >= 256 ? 0 : img.size;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(img.data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += img.data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/** ICNS with PNG-backed chunk types. */
function icns(entries) {
  const chunks = entries.map(([type, size]) => {
    const data = png(size);
    const head = Buffer.alloc(8);
    head.write(type, 0, 4, 'ascii');
    head.writeUInt32BE(data.length + 8, 4);
    return Buffer.concat([head, data]);
  });
  const body = Buffer.concat(chunks);
  const head = Buffer.alloc(8);
  head.write('icns', 0, 4, 'ascii');
  head.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([head, body]);
}

mkdirSync(OUT, { recursive: true });

for (const [name, size] of [
  ['32x32.png', 32],
  ['128x128.png', 128],
  ['128x128@2x.png', 256],
  ['icon.png', 512],
  ['Square30x30Logo.png', 30],
  ['Square44x44Logo.png', 44],
  ['Square71x71Logo.png', 71],
  ['Square89x89Logo.png', 89],
  ['Square107x107Logo.png', 107],
  ['Square142x142Logo.png', 142],
  ['Square150x150Logo.png', 150],
  ['Square284x284Logo.png', 284],
  ['Square310x310Logo.png', 310],
  ['StoreLogo.png', 50],
]) {
  writeFileSync(join(OUT, name), png(size));
}

writeFileSync(join(OUT, 'icon.ico'), ico([16, 32, 48, 64, 256]));
writeFileSync(
  join(OUT, 'icon.icns'),
  icns([
    ['ic07', 128],
    ['ic08', 256],
    ['ic09', 512],
    ['ic11', 32],
    ['ic12', 64],
    ['ic13', 256],
    ['ic14', 512],
  ]),
);

console.log(`icons written to ${OUT}`);
