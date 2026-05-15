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
  'N': 'npc',
};

function parse(rows: string[]): MapTile[][] {
  return rows.map(row =>
    row.split('').map<MapTile>(ch => ({ type: GLYPH[ch] ?? 'grass' }))
  );
}

const VILLAGE_ROWS = [
  '############',
  '#..........#',
  '#.N...S....#',
  '#..........#',
  '#.......N..#',
  '#...I......#',
  '#..N.......#',
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
    npcs: {
      '2,2': {
        name: '村長',
        emoji: '👴',
        lines: [
          { speaker: '村長', text: '歡迎來到碧楓村，年輕的冒險者。' },
          { speaker: '村長', text: '最近村南的幽影迷宮鬧出怪事⋯野獸增加、夜裡有奇怪聲響。' },
          {
            speaker: '村長',
            text: '若你願意幫忙調查，全村都會感謝你。',
            choices: [
              { text: '⚔️ 接受任務', action: 'accept-quest' },
              { text: '之後再說', action: 'close' },
            ],
          },
        ],
      },
      '8,4': {
        name: '神秘冒險者',
        emoji: '🧙‍♂️',
        lines: [
          { speaker: '神秘冒險者', text: '⋯你也是來挑戰迷宮的？' },
          { speaker: '神秘冒險者', text: '迷宮深處有頭幽魂龍，比一般怪強得多。' },
          { speaker: '神秘冒險者', text: '沒等級五以上、沒鐵劍皮甲，最好別硬上。' },
          { speaker: '神秘冒險者', text: '⋯祝你好運。' },
        ],
      },
      '3,6': {
        name: '旅店老闆娘',
        emoji: '👩‍🍳',
        lines: [
          { speaker: '旅店老闆娘', text: '累了嗎？旅館一晚 10 金幣，包你 HP / MP 全滿。' },
          { speaker: '旅店老闆娘', text: '對了，按 ESC 可以打開系統選單，存檔別忘了。' },
        ],
      },
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
