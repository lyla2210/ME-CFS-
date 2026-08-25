import { existsSync, renameSync, statSync } from 'node:fs';
import sharp from 'sharp';

const input = existsSync('public/assets/space-map.original.png')
  ? 'public/assets/space-map.original.png'
  : 'public/assets/space-map.png';
const webpOut = 'public/assets/space-map.webp';
const pngOut = 'public/assets/space-map.png';
const pngTmp = 'public/assets/space-map.compressed.png';

const before = existsSync(pngOut) ? statSync(pngOut).size : statSync(input).size;

await sharp(input)
  .resize(920, null, { withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 88, effort: 6 })
  .toFile(webpOut);

await sharp(input)
  .resize(920, null, { withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(pngTmp);

renameSync(pngTmp, pngOut);

console.log(`space-map.png: ${before} → ${statSync(pngOut).size} bytes`);
console.log(`space-map.webp: ${statSync(webpOut).size} bytes`);
