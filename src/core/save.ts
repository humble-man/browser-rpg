import type { Player } from './types';

export const SAVE_KEY = 'browser-rpg.save.v1';

export interface SaveData {
  player: Player;
  flags: Record<string, boolean>;
  bossDefeated: boolean;
}

export function saveToStorage(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Save failed:', e);
  }
}

export function loadFromStorage(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
