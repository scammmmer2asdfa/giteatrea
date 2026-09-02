// Generates every icon Tauri needs from one procedural drawing, so the source of
// truth is this file rather than a set of opaque binaries.
// Run: node apps/desktop/scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src-tauri', 'icons');

const GROUND = [0x13, 0x13, 0x16];
const ACCENT = [0xff, 0x6b, 0x1a];
const INK = [0xf0, 0xf0, 0xf2];

/**
 * The RepoLens mark: a viewfinder reticle framing one parcel of a treemap.
 * The blocks are the repository, the brackets are the lens, and the orange
 * block is whatever you are currently looking at.
 */
function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    // Composite onto whatever is already there so overlaps read correctly.
    const dst = px[i + 3];
    const sa = a / 255;
    const da = (dst / 255) * (1 - sa);
    const out = sa + da;
    px[i] = out ? Math.round((r * sa + px[i] * da) / out) : 0;
    px[i + 1] = out ? Math.round((g * sa + px[i + 1] * da) / out) : 0;
    px[i + 2] = out ? Math.round((b * sa + px[i + 2] * da) / out) : 0;
    px[i + 3] = Math.round(out * 255);
  };
  const rect = (x0, y0, x1, y1, color, a = 255) => {
    // Normalized so callers may pass reversed bounds (used to mirror corners).
    const ax = Math.round(Math.min(x0, x1));
    const bx = Math.round(Math.max(x0, x1));
    const ay = Math.round(Math.min(y0, y1));
    const by = Math.round(Math.max(y0, y1));
    for (let y = ay; y < by; y++) {
      for (let x = ax; x < bx; x++) set(x, y, color, a);
    }
  };

  const s = size;
  const u = s / 24;
  rect(0, 0, s, s, GROUND);

  // Treemap parcels, sized unevenly the way real file weights fall.
  const g = Math.max(1, Math.round(0.7 * u));
  rect(2 * u, 2 * u, 13 * u, 11 * u, INK, 70);
  rect(13 * u + g, 2 * u, 22 * u, 7 * u, INK, 70);
  rect(13 * u + g, 7 * u + g, 22 * u, 11 * u, INK, 70);
  rect(2 * u, 11 * u + g, 8 * u, 22 * u, INK, 70);
  rect(8 * u + g, 11 * u + g, 22 * u, 22 * u, INK, 70);

  // The parcel under inspection.
  rect(10.5 * u, 13.2 * u, 16.5 * u, 19.3 * u, ACCENT);

  // Viewfinder brackets: four corners with clearance, never a closed box.
  const t = Math.max(1, Math.round(1.2 * u));
  const arm = 3 * u;
  const x0 = 7 * u;
  const y0 = 10 * u;
  const x1 = 20 * u;
  const y1 = 22.5 * u;
  const corner = (cx, cy, dx, dy) => {
    rect(cx, cy, cx + dx * arm, cy + dy * t, INK);
    rect(cx, cy, cx + dx * t, cy + dy * arm, INK);
  };
  corner(x0, y0, 1, 1);
  corner(x1, y0, -1, 1);
  corner(x0, y1, 1, -1);
  corner(x1, y1, -1, -1);

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
