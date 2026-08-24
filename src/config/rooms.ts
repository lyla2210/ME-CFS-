import { ASSETS } from './assets';

export type RoomId = 'rest' | 'brain-fog' | 'pem' | 'result';

/** Hotspot bounds are % of the space-map PNG (top-left origin). */
export interface RoomConfig {
  id: RoomId;
  order: number;
  label: string;
  title: string;
  subtitle: string;
  path: `/room/${RoomId}`;
  image: string;
  hotspot: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  /** Future: simulation step id inside /simulation */
  simulationStep?: number;
}

export const ROOMS: RoomConfig[] = [
  {
    id: 'rest',
    order: 1,
    label: 'ROOM 1',
    title: 'Rest',
    subtitle: 'Non-restorative sleep · impossible rest',
    path: '/room/rest',
    image: ASSETS.roomRest,
    hotspot: { left: 68, top: 30, width: 28, height: 44 },
    simulationStep: 1,
  },
  {
    id: 'brain-fog',
    order: 2,
    label: 'ROOM 2',
    title: 'Brain Fog',
    subtitle: 'Cognitive fog · dissolving speech',
    path: '/room/brain-fog',
    image: ASSETS.roomBrainFog,
    hotspot: { left: 44, top: 6, width: 28, height: 38 },
    simulationStep: 2,
  },
  {
    id: 'pem',
    order: 3,
    label: 'ROOM 3',
    title: 'PEM',
    subtitle: 'Post-exertional malaise · delayed crash',
    path: '/room/pem',
    image: ASSETS.roomPem,
    hotspot: { left: 5, top: 6, width: 34, height: 40 },
    simulationStep: 3,
  },
  {
    id: 'result',
    order: 4,
    label: 'ROOM 4',
    title: 'The Result',
    subtitle: 'Normal labs · gaslighting verdict',
    path: '/room/result',
    image: ASSETS.roomResult,
    hotspot: { left: 20, top: 60, width: 44, height: 34 },
    simulationStep: 4,
  },
];

export const ROOM_BY_ID = Object.fromEntries(
  ROOMS.map((room) => [room.id, room])
) as Record<RoomId, RoomConfig>;

export function isRoomId(value: string | undefined): value is RoomId {
  return value !== undefined && value in ROOM_BY_ID;
}
