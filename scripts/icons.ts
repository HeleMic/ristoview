// Renders every app icon from the two vector sources in assets/.
// Run with `bun run icons` after editing assets/icon.svg or assets/icon-monochrome.svg.
import sharp from 'sharp';

const BLUSH = '#fdeef2';
const icon = await Bun.file('assets/icon.svg').text();
const mono = await Bun.file('assets/icon-monochrome.svg').text();

/** Android masks maskable icons to as little as an 80% circle: shrink the art onto the same ground. */
const maskable = icon
  .replace(/(<rect width="1024" height="1024" fill="#fdeef2"\/>)/, '$1<g transform="translate(512 512) scale(0.8) translate(-512 -512)">')
  .replace('</svg>', '</g></svg>');

async function png(svg: string, size: number, out: string, opaque = true) {
  let img = sharp(Buffer.from(svg), { density: 300 }).resize(size, size);
  // iOS fills transparent pixels with black: home screen icons must be fully opaque.
  if (opaque) img = img.flatten({ background: BLUSH });
  await img.png({ compressionLevel: 9 }).toFile(out);
  console.log(`${out} ${size}x${size}`);
}

await png(icon, 180, 'public/apple-touch-icon.png');
await png(icon, 64, 'public/pwa-64x64.png');
await png(icon, 192, 'public/pwa-192x192.png');
await png(icon, 512, 'public/pwa-512x512.png');
await png(maskable, 512, 'public/maskable-icon-512x512.png');
await png(mono, 512, 'public/monochrome-icon-512x512.png', false);
