/**
 * Generate KesbYar PWA icons from the official "growth bars" mark.
 * Dark charcoal tile + pastel ascending bars + trend line.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function roundedRectContains(nx, ny, x, y, w, h, r) {
  if (nx < x || nx > x + w || ny < y || ny > y + h) return false;
  const lx = nx - x;
  const ly = ny - y;
  if (lx >= r && lx <= w - r) return true;
  if (ly >= r && ly <= h - r) return true;
  const cx = lx < r ? r : w - r;
  const cy = ly < r ? r : h - r;
  const dx = lx - cx;
  const dy = ly - cy;
  return dx * dx + dy * dy <= r * r;
}

function circleContains(nx, ny, cx, cy, radius) {
  const dx = nx - cx;
  const dy = ny - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/** Approximate the trend stroke as a thick quadratic-ish band. */
function nearTrend(nx, ny, stroke) {
  // Control points matching SVG path M32,66 C50,48 60,58 72,68 S90,72 100,54 (normalized /128)
  const pts = [];
  for (let t = 0; t <= 1; t += 0.02) {
    // piecewise: ease from left to peak
    const x = 32 / 128 + t * ((100 - 32) / 128);
    const y =
      66 / 128 +
      Math.sin(t * Math.PI) * -0.18 +
      t * t * -0.02 +
      (1 - t) * 0.02;
    // Better curve fit for growth path
    const yy = 0.516 + (0.39 - 0.516) * t + Math.sin(t * Math.PI) * -0.12;
    pts.push([x, yy]);
  }
  const half = stroke / 2;
  for (const [px, py] of pts) {
    const dx = nx - px;
    const dy = ny - py;
    if (dx * dx + dy * dy <= half * half) return true;
  }
  return false;
}

function makePng(size, { maskable = false } = {}) {
  const rows = [];
  const pad = maskable ? 0.12 : 0;
  const content = 1 - 2 * pad;

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 4;
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;

      // Map into icon content box (with safe zone for maskable)
      const u = (nx - pad) / content;
      const v = (ny - pad) / content;

      let R = 0;
      let G = 0;
      let B = 0;
      let A = 0;

      if (maskable && (u < 0 || u > 1 || v < 0 || v > 1)) {
        // soft outer field
        R = 28;
        G = 25;
        B = 23;
        A = 255;
      } else if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
        const rr = 32 / 128;
        const inTile = roundedRectContains(u, v, 0, 0, 1, 1, rr);
        if (inTile) {
          R = 0x1c;
          G = 0x19;
          B = 0x17;
          A = 255;

          const bars = [
            { x: 28 / 128, y: 72 / 128, w: 18 / 128, h: 28 / 128, r: 6 / 128, c: [0xf2, 0xb8, 0xb8] },
            { x: 55 / 128, y: 52 / 128, w: 18 / 128, h: 48 / 128, r: 6 / 128, c: [0x8f, 0xb8, 0x9e] },
            { x: 82 / 128, y: 34 / 128, w: 18 / 128, h: 66 / 128, r: 6 / 128, c: [0xf5, 0xc9, 0xa8] },
          ];
          for (const b of bars) {
            if (roundedRectContains(u, v, b.x, b.y, b.w, b.h, b.r)) {
              R = b.c[0];
              G = b.c[1];
              B = b.c[2];
            }
          }

          if (nearTrend(u, v, 5 / 128)) {
            R = 0xff;
            G = 0xfb;
            B = 0xf8;
          }
          if (circleContains(u, v, 100 / 128, 50 / 128, 6 / 128)) {
            R = 0xf2;
            G = 0xb8;
            B = 0xb8;
          }
        } else if (maskable) {
          R = 28;
          G = 25;
          B = 23;
          A = 255;
        }
      }

      row[i] = R;
      row[i + 1] = G;
      row[i + 2] = B;
      row[i + 3] = A;
    }
    rows.push(row);
  }

  const compressed = zlib.deflateSync(Buffer.concat(rows));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(outDir, { recursive: true });
for (const s of [72, 96, 128, 144, 152, 192, 384, 512]) {
  fs.writeFileSync(path.join(outDir, `icon-${s}.png`), makePng(s));
}
fs.writeFileSync(path.join(outDir, 'maskable-512.png'), makePng(512, { maskable: true }));
console.log('Generated growth-bars icons in', outDir);
