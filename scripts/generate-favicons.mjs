// Generates the full favicon/icon set from public/favicon.svg using sharp.
// Run: node scripts/generate-favicons.mjs
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const src = join(pub, 'favicon.svg');

// PNG raster targets. Keys are output filenames.
const PNGS = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'favicon-48x48.png': 48,
  'apple-touch-icon.png': 180, // iOS home screen
  'icon-192.png': 192, // PWA / Android
  'icon-512.png': 512, // PWA / Android maskable + splash
};

// Sizes bundled into the multi-resolution favicon.ico.
const ICO_SIZES = [16, 32, 48];

const svg = await readFile(src);

// Render one PNG buffer at a given square size.
const png = (size) =>
  sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

// Write the standalone PNGs.
for (const [name, size] of Object.entries(PNGS)) {
  await writeFile(join(pub, name), await png(size));
  console.log(`  public/${name}  (${size}x${size})`);
}

// Build favicon.ico by packing PNG-encoded images (valid per the ICO spec,
// supported by all modern browsers) — no extra dependency needed.
const images = await Promise.all(ICO_SIZES.map((s) => png(s)));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(images.length, 4); // image count

const entrySize = 16;
let offset = header.length + entrySize * images.length;
const entries = [];
for (let i = 0; i < images.length; i++) {
  const size = ICO_SIZES[i];
  const buf = images[i];
  const e = Buffer.alloc(entrySize);
  e.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 => 256)
  e.writeUInt8(size >= 256 ? 0 : size, 1); // height
  e.writeUInt8(0, 2); // color palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(buf.length, 8); // image data size
  e.writeUInt32LE(offset, 12); // data offset
  offset += buf.length;
  entries.push(e);
}

await writeFile(join(pub, 'favicon.ico'), Buffer.concat([header, ...entries, ...images]));
console.log(`  public/favicon.ico  (${ICO_SIZES.join(', ')})`);
console.log('Done.');
