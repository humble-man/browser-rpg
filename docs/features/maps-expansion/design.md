# 設計 Design — Maps expansion + treasure chests

## 1. Types

```typescript
export type TileType = ... | 'treasure';

export interface TreasureContent {
  itemId: string;
  count: number;
}

export interface GameMap {
  // ...existing
  treasures?: Record<string, TreasureContent>;  // key = "x,y"
}
```

## 2. `data/maps.ts` 重畫

### 2.1 GLYPH 加 `T`

```typescript
const GLYPH: Record<string, TileType> = {
  '.': 'grass',
  '#': 'wall',
  'S': 'shop',
  'I': 'inn',
  'D': 'dungeon-entry',
  'E': 'village-exit',
  'B': 'boss',
  'f': 'floor',
  'T': 'treasure',  // ← 新增
};
```

### 2.2 碧楓村（12 寬 × 10 高）

```
############
#..........#
#.....S....#       S(6,2) shop
#..........#
#..........#
#...I......#       I(4,5) inn
#..........#
#......T...#       T(7,7) iron-sword×1
#.........D#       D(10,8) dungeon
############
```

Spawn: `(5, 4)`, treasures: `{ '7,7': { itemId: 'iron-sword', count: 1 } }`

### 2.3 幽影迷宮（15 寬 × 12 高）

```
###############
#E............#       E(1,1) exit
#.fffffff.f...#
#.f###.fffff..#
#.f.f....f.f..#
#.f.fff..f.T..#       T(11,5) potion×3
#.f.....f.f...#
#.fffffff.f...#
#..........fT.#       T(12,8) ether×2
#.fffffff.f...#
#...........B.#       B(12,10) boss
###############
```

Spawn: `(2, 1)`, treasures: `{ '11,5': { itemId: 'potion', count: 3 }, '12,8': { itemId: 'ether', count: 2 } }`

## 3. `store.ts:movePlayer` — treasure 分支

在 dungeon-entry / boss check 之間插入：

```typescript
if (movedTile.type === 'treasure') {
  const flagKey = `treasure-${mapId}-${nx}-${ny}`;
  if (get().flags[flagKey]) {
    set(s => { s.messages.push('📯 空寶箱'); });
    return;
  }
  const map = MAPS[mapId];
  const content = map.treasures?.[`${nx},${ny}`];
  if (content) {
    set(s => {
      addItem(s.player, content.itemId, content.count);
      const item = getItem(content.itemId);
      const name = item?.name ?? content.itemId;
      s.flags[flagKey] = true;
      s.messages.push(`📦 拾獲「${name}」×${content.count}`);
    });
    get().saveGame();
  }
  return;
}
```

## 4. `store.ts:loadGame` — wall 救援

```typescript
const map = MAPS[raw.player.position.mapId];
const tile = map.tiles[raw.player.position.y]?.[raw.player.position.x];
if (!tile || tile.type === 'wall') {
  raw.player.position.x = map.spawn.x;
  raw.player.position.y = map.spawn.y;
}
```

## 5. `Overworld.tsx` — 動態 treasure glyph

查 flags 決定 📦 / 📯：

```typescript
let glyph = TILE_GLYPH[tile.type] ?? '';
if (tile.type === 'treasure') {
  const opened = flags[`treasure-${player.position.mapId}-${x}-${y}`];
  glyph = opened ? '📯' : '📦';
}
```

## 6. CSS

```css
.tile-treasure {
  background: linear-gradient(135deg, #c0a040, #8a7020);
}
```

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| 戰鬥相關全部 | 不涉及 |
| 商店 / 旅館 / shop 邏輯 | 不影響 |
| Shop.tsx / Battle.tsx / Title.tsx / GameOver.tsx | UI 與 treasure 無關 |
| session-lock.ts | 與 lock 無關 |
| enemy-ai.ts | 與 AI 無關 |
| save.ts | 結構相容（flags 已存在）|

## 8. 驗證計畫

full playthrough。驗證 case 見 PR 評論。

### 回歸測試

Cycle 1 / 2 / 3 / 4 功能仍正常。

## 9. 風險與緩解

- 路徑不可達 → 驗證階段手動走過所有寶箱與 boss
- encounter 過頻 → 保持18%觀察
- 舊 save 卡 wall → loadGame 救援機制
