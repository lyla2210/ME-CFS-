import { ASSETS } from '../config/assets';

let preloadStarted = false;

/** Start fetching the floor plan during hero / blackout so the map appears faster. */
export function preloadSpaceMap() {
  if (preloadStarted || typeof document === 'undefined') return;
  preloadStarted = true;

  const webp = document.createElement('link');
  webp.rel = 'preload';
  webp.as = 'image';
  webp.href = ASSETS.spaceMapWebp;
  webp.type = 'image/webp';
  document.head.appendChild(webp);

  const png = document.createElement('link');
  png.rel = 'preload';
  png.as = 'image';
  png.href = ASSETS.spaceMap;
  png.type = 'image/png';
  document.head.appendChild(png);
}
