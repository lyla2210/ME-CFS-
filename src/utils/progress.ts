const STORAGE_KEY = 'mecfs_room_progress';
const FREE_EXPLORE_KEY = 'mecfs_free_explore';

/** Highest room order the user may enter (1 = Rest only). Ignored when free explore is on. */
export function getUnlockedRoomOrder(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) ? Math.min(4, Math.max(1, n)) : 1;
  } catch {
    return 1;
  }
}

export function unlockRoomOrder(order: number) {
  try {
    const next = Math.min(4, Math.max(getUnlockedRoomOrder(), order));
    localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new CustomEvent('mecfs-progress'));
  } catch {
    // ignore
  }
}

/** After all four stages finish — any room can be entered freely. */
export function isFreeExplore(): boolean {
  try {
    return localStorage.getItem(FREE_EXPLORE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enableFreeExplore() {
  try {
    localStorage.setItem(FREE_EXPLORE_KEY, '1');
    localStorage.setItem(STORAGE_KEY, '4');
    window.dispatchEvent(new CustomEvent('mecfs-progress'));
  } catch {
    // ignore
  }
}

export function isRoomUnlocked(roomOrder: number): boolean {
  if (isFreeExplore()) return true;
  return roomOrder <= getUnlockedRoomOrder();
}

export function resetProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
    localStorage.removeItem(FREE_EXPLORE_KEY);
    window.dispatchEvent(new CustomEvent('mecfs-progress'));
  } catch {
    // ignore
  }
}
