// Genera íconos PNG simples (fondo verde esmeralda + gota/pin blanco) para el manifest PWA.
// Placeholder programático: reemplazar por un ícono diseñado antes de un lanzamiento real.
import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const BG = [5, 150, 105]; // emerald-600
const FG = [255, 255, 255];

function crc(buf) {
  return crc32(buf) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function pinMask(x, y, size) {
  // Gota de mapa simple: círculo en la mitad superior + triángulo hacia abajo.
  const cx = size / 2;
  const cy = size * 0.42;
  const r = size * 0.26;
  const dx = x - cx;
  const dy = y - cy;
  if (dx * dx + dy * dy <= r * r) return true;
  // punta inferior (triángulo)
  const tipY = size * 0.82;
  if (y > cy && y < tipY) {
    const t = (y - cy) / (tipY - cy);
    const halfWidth = r * (1 - t);
    if (Math.abs(dx) <= halfWidth) return true;
  }
  return false;
}

function generateIcon(size) {
  const rowBytes = size * 3;
  const raw = Buffer.alloc((rowBytes + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (rowBytes + 1);
    raw[rowStart] = 0; // sin filtro
    for (let x = 0; x < size; x++) {
      const isFg = pinMask(x, y, size);
      const [r, g, b] = isFg ? FG : BG;
      const off = rowStart + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(process.cwd(), "public", "icons");
mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const png = generateIcon(size);
  writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`Generado icon-${size}.png (${png.length} bytes)`);
}
