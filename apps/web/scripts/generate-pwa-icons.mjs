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

function makePng(size, { maskable = false } = {}) {
  const rows = [];
  const pad = maskable ? 0.18 : 0.08;
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 4;
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;
      const dx = Math.abs(nx - 0.5) / (0.5 - pad);
      const dy = Math.abs(ny - 0.5) / (0.5 - pad);
      const inside = Math.max(dx, dy) <= 1;

      if (!inside && !maskable) {
        row[i] = 0;
        row[i + 1] = 0;
        row[i + 2] = 0;
        row[i + 3] = 0;
        continue;
      }

      const t = (nx + ny) / 2;
      let R = Math.round(185 + t * 40);
      let G = Math.round(212 - t * 20);
      let B = Math.round(240 - t * 50);
      let A = 255;

      if (maskable && !inside) {
        R = 210;
        G = 225;
        B = 240;
      }

      const bars = [
        { x0: 0.3, h: 0.26, c: [245, 198, 194] },
        { x0: 0.44, h: 0.4, c: [168, 201, 184] },
        { x0: 0.58, h: 0.52, c: [245, 201, 168] },
      ];
      for (const b of bars) {
        const bx0 = pad + (1 - 2 * pad) * b.x0;
        const bw = (1 - 2 * pad) * 0.1;
        const top = pad + (1 - 2 * pad) * (0.7 - b.h);
        const bot = pad + (1 - 2 * pad) * 0.72;
        if (nx >= bx0 && nx < bx0 + bw && ny >= top && ny <= bot) {
          R = b.c[0];
          G = b.c[1];
          B = b.c[2];
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
console.log('Generated icons in', outDir);
