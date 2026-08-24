const STORAGE_KEY = 'mecfs_room_progress';

/** Highest room order the user may enter (1 = Rest only, 4 = all rooms). */
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

export function isRoomUnlocked(roomOrder: number): boolean {
  return roomOrder <= getUnlockedRoomOrder();
}

export function resetProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
    window.dispatchEvent(new CustomEvent('mecfs-progress'));
  } catch {
    // ignore
  }
}
