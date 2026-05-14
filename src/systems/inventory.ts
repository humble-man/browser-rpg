import type { Item, Player } from '../core/types';
import ITEMS_RAW from '../data/items.json';

export const ITEMS: Record<string, Item> = ITEMS_RAW as Record<string, Item>;

export function getItem(itemId: string): Item | undefined {
  return ITEMS[itemId];
}

export function countOf(player: Player, itemId: string): number {
  return player.inventory.find(i => i.itemId === itemId)?.count ?? 0;
}

export function addItem(player: Player, itemId: string, n = 1): void {
  const existing = player.inventory.find(i => i.itemId === itemId);
  if (existing) existing.count += n;
  else player.inventory.push({ itemId, count: n });
}

export function removeItem(player: Player, itemId: string, n = 1): boolean {
  const idx = player.inventory.findIndex(i => i.itemId === itemId);
  if (idx < 0) return false;
  const slot = player.inventory[idx];
  if (slot.count < n) return false;
  slot.count -= n;
  if (slot.count <= 0) player.inventory.splice(idx, 1);
  return true;
}

// Returns a description of what happened, or null if the item could not be used.
export function applyConsumable(player: Player, itemId: string): string | null {
  const item = getItem(itemId);
  if (!item || item.type !== 'consumable' || !item.effect) return null;
  switch (item.effect.type) {
    case 'heal': {
      const before = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + (item.effect.amount ?? 0));
      return `回復 ${player.hp - before} HP`;
    }
    case 'restoreMp': {
      const before = player.mp;
      player.mp = Math.min(player.maxMp, player.mp + (item.effect.amount ?? 0));
      return `回復 ${player.mp - before} MP`;
    }
    case 'cure':
      return '狀態已淨化';
  }
}

export function equip(player: Player, itemId: string): boolean {
  const item = getItem(itemId);
  if (!item) return false;
  if (item.type !== 'weapon' && item.type !== 'armor') return false;
  // Remove bonus from previously equipped slot
  const slot = item.type;
  const prevId = player.equipment[slot];
  if (prevId) {
    const prev = getItem(prevId);
    if (prev?.bonus) {
      player.atk -= prev.bonus.atk ?? 0;
      player.def -= prev.bonus.def ?? 0;
      player.spd -= prev.bonus.spd ?? 0;
      player.maxHp -= prev.bonus.maxHp ?? 0;
      player.maxMp -= prev.bonus.maxMp ?? 0;
    }
    // Put it back in inventory
    addItem(player, prevId, 1);
  }
  // Apply new
  if (item.bonus) {
    player.atk += item.bonus.atk ?? 0;
    player.def += item.bonus.def ?? 0;
    player.spd += item.bonus.spd ?? 0;
    player.maxHp += item.bonus.maxHp ?? 0;
    player.maxMp += item.bonus.maxMp ?? 0;
  }
  player.equipment[slot] = itemId;
  removeItem(player, itemId, 1);
  return true;
}
