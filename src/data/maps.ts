import type { GameMap, MapId, MapTile, TileType } from '../core/types';

// Tile glyph legend used in the string-form map definitions:
//   .  grass / floor (walkable)
//   #  wall (blocking)
//   S  shop (interact)
//   I  inn (interact)
//   D  dungeon entry (transition to dungeon)
//   E  village exit (transition to village)
//   B  boss tile (boss battle trigger)
const GLYPH: Record<string, TileType> = {
  '.': 'grass',
  '#': 'wall',
  'S': 'shop',
  'I': 'inn',
  'D': 'dungeon-entry',
  'E': 'village-exit',
  'B': 'boss',
  'f': 'floor',
};

function parse(rows: string[]): MapTile[][] {
  return rows.map(row =>
    row.split('').map<MapTile>(ch => ({ type: GLYPH[ch] ?? 'grass' }))
  );
}

const VILLAGE_ROWS = [
  '##########',
  '#........#',
  '#...S....#',
  '#........#',
  '#.I......#',
  '#........#',
  '#.......D#',
  '##########',
];

const DUNGEON_ROWS = [
  '##########',
  '#E.......#',
  '#.fffffff#',
  '#.f###.f.#',
  '#.f.f.ff.#',
  '#.f.f.#f.#',
  '#.....ffB#',
  '##########',
];

export const MAPS: Record<MapId, GameMap> = {
  village: {
    id: 'village',
    name: '初始之村「碧楓村」',
    width: 10,
    height: 8,
    tiles: parse(VILLAGE_ROWS),
    spawn: { x: 4, y: 4 },
  },
  dungeon: {
    id: 'dungeon',
    name: '幽影迷宮',
    width: 10,
    height: 8,
    tiles: parse(DUNGEON_ROWS),
    encounters: ['slime', 'goblin', 'skeleton', 'spider'],
    encounterRate: 0.18,
    spawn: { x: 2, y: 1 },
  },
};

export function isWalkable(t: MapTile): boolean {
  return t.type !== 'wall';
}
