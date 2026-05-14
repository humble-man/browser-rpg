import type { GameMap, MapId, MapTile, TileType } from '../core/types';

// Tile glyph legend used in the string-form map definitions:
//   .  grass / floor (walkable)
//   #  wall (blocking)
//   S  shop (interact)
//   I  inn (interact)
//   D  dungeon entry (transition to dungeon)
//   E  village exit (transition to village)
//   B  boss tile (boss battle trigger)
//   T  treasure chest
//   f  floor (visually distinct from grass)
const GLYPH: Record<string, TileType> = {
  '.': 'grass',
  '#': 'wall',
  'S': 'shop',
  'I': 'inn',
  'D': 'dungeon-entry',
  'E': 'village-exit',
  'B': 'boss',
  'f': 'floor',
  'T': 'treasure',
};

function parse(rows: string[]): MapTile[][] {
  return rows.map(row =>
    row.split('').map<MapTile>(ch => ({ type: GLYPH[ch] ?? 'grass' }))
  );
}

const VILLAGE_ROWS = [
  '############',
  '#..........#',
  '#.....S....#',
  '#..........#',
  '#..........#',
  '#...I......#',
  '#..........#',
  '#......T...#',
  '#.........D#',
  '############',
];

const DUNGEON_ROWS = [
  '###############',
  '#E............#',
  '#.fffffff.f...#',
  '#.f###.fffff..#',
  '#.f.f....f.f..#',
  '#.f.fff..f.T..#',
  '#.f.....f.f...#',
  '#.fffffff.f...#',
  '#..........fT.#',
  '#.fffffff.f...#',
  '#...........B.#',
  '###############',
];

export const MAPS: Record<MapId, GameMap> = {
  village: {
    id: 'village',
    name: '初始之村「碧楓村」',
    width: 12,
    height: 10,
    tiles: parse(VILLAGE_ROWS),
    spawn: { x: 5, y: 4 },
    treasures: {
      '7,7': { itemId: 'iron-sword', count: 1 },
    },
  },
  dungeon: {
    id: 'dungeon',
    name: '幽影迷宮',
    width: 15,
    height: 12,
    tiles: parse(DUNGEON_ROWS),
    encounters: ['slime', 'goblin', 'skeleton', 'spider'],
    encounterRate: 0.18,
    spawn: { x: 2, y: 1 },
    treasures: {
      '11,5': { itemId: 'potion', count: 3 },
      '12,8': { itemId: 'ether', count: 2 },
    },
  },
};

export function isWalkable(t: MapTile): boolean {
  return t.type !== 'wall';
}
