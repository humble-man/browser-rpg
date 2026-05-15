# 設計 Design — Dungeon mini-boss

## 1. Types

`TileType += 'mini-boss'`

## 2. `data/maps.ts`

- GLYPH `'M': 'mini-boss'`
- 迷宮 row 7 `#.fffffff.f...#` → `#.fffffM.f...#`（M at col 7）

## 3. `data/monsters.json` 新增 mistHunter

見 PR diff。HP 80 / ATK 14 / DEF 7 / SPD 6 / XP 80 / Gold 50 / drops leather-armor 100%。
無 ai（走 default attack-only）。

## 4. `store.ts:movePlayer` mini-boss 分支

```typescript
if (movedTile.type === 'mini-boss') {
  if (!get().flags['mini-boss-defeated']) {
    get().startBattle('mistHunter', true);
  }
  return;
}
```

## 5. `store.ts:playerAct` victory enemy.id 区分

```typescript
if (s.battle.isBoss) {
  if (s.battle.enemy.id === 'dragon') {
    s.bossDefeated = true;
    s.flags[QUEST_DONE] = true;
  } else if (s.battle.enemy.id === 'mistHunter') {
    s.flags['mini-boss-defeated'] = true;
  }
}
```

## 6. `Overworld.tsx`

- TILE_GLYPH `'mini-boss': '⚔️'`
- 動態：flag `mini-boss-defeated` true 顯示 `🗡️` else `⚔️`

## 7. CSS

`.tile-mini-boss`：暗紅漸層（與 boss 紫紅區隤）

## 8. 不動的部分

| 模組 | 為何不動 |
|---|---|
| save.ts | flags 已持久化 |
| Battle.tsx / Shop / Title / GameOver | 不涉及 |
| systems | 不涉及 |
| BattleState type | 不改 |
| 其他怪物 JSON | 不動 |

## 9. 驗證計畫

見 PR 評論。7 個 case：地圖顯示、觸發戰鬥、戰勝獎勵、不重複、reload 狀態、龍 quest 仍正常、inventory 拾獲。

### 回歸測試

Cycle 1-11 全功能保留。

## 10. 風險

- enemy.id switch 未來加新 boss 記得更新
- (7,7) 位置可路徑包圍但繞路成本高
- mistHunter 平衡見驗證階段
- flag 命名避衝突 ✅
