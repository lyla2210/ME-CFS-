/**
 * Central asset paths — update filenames here when PNGs change.
 * All paths are served from /public (Vite static root).
 */
export const ASSETS = {
  spaceMap: '/assets/space-map.png',
  roomRest: '/assets/room-rest.png',
  roomBrainFog: '/assets/room-brain-fog.png',
  roomPem: '/assets/room-pem.png',
  roomResult: '/assets/room-result.png',
} as const;

export type AssetKey = keyof typeof ASSETS;
