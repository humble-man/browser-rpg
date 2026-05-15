# 分析 Analysis — Dungeon mini-boss

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 玩家走進迷宮 | 地圖上看到 ⚔️ tile |
| 走上 mini-boss tile | 觸發迷霧獵手戰鬥（HP 80） |
| 戰勝 | +80 XP, +50 Gold, 1 leather-armor, flag set, save |
| 戰敗 | GameOver |
| 戰勝後再踩 | 不重複觸發，tile 顯示「已擊敗」淡化版 |
| reload | flag 持久化、狀態保留 |
| 戰勝後遇龍 | 龍邏輯不變 |

## 2. 資料模型

- TileType += `'mini-boss'`
- GLYPH += `'M'`
- 新 monster `mistHunter`：HP 80, ATK 14, DEF 7, SPD 6, XP 80, Gold 50, drops leather-armor 100%
- flag `mini-boss-defeated`

## 3. 迷宮地圖加 M tile

row 7：`#.fffffff.f...#` → `#.fffffM.f...#`。
M 位置 (7, 7)、中段 floor 區。路徑可達。

## 4. movePlayer + victory 邏輯

選**方案 B**：startBattle isBoss=true、victory 內看 enemy.id 決定 flag。

```typescript
if (s.battle.isBoss) {
  if (s.battle.enemy.id === 'dragon') {
    s.bossDefeated = true;
    s.flags['quest-elder-completed'] = true;
  } else if (s.battle.enemy.id === 'mistHunter') {
    s.flags['mini-boss-defeated'] = true;
  }
}
```

比加 startBattle 參數簡潔。

## 5. UI 顯示

TILE_GLYPH 加 `'mini-boss': '⚔️'`（未擊敗），動態判斷已擊敗顯示 `🗡️`。

## 6. 邊界案例

- **flag 反覆觸發**：movePlayer 內檢查 flag、防重複
- **戰敗**：GameOver 路徑同 boss
- **未打 mini-boss 直接打龍**：可行，optional 中段挑戰
- **drops 已實作**：cycle 1 victory 邏輯 handle drops，chance 1.0 必掉

## 7. 模組架構

| 檔案 | 變動 |
|---|---|
| types.ts | TileType += `'mini-boss'` |
| maps.ts | GLYPH += `'M'`、迷宮 row 7 改 M |
| monsters.json | 新 mistHunter |
| store.ts | movePlayer mini-boss 分支、victory enemy.id switch |
| Overworld.tsx | TILE_GLYPH 加、動態顯示 |
| index.css | `.tile-mini-boss` |

## 8. 約束

- 不破壞 cycle 11（dragon 仍 set quest flag）
- 不破壞 cycle 5（treasure tiles）
- 不破壞 cycle 3（mistHunter 無 ai 走 default）
- 時間預算：~1 hr + 30 min 驗證

## 9. 風險

- enemy.id switch 未來加新 boss 要記得更新
- isBoss 語意混淆—保留為「boss 級」、flag 由 id 決定
- 平衡：atk 14 對 Lv.1 玩家約 3-4 hits 致死，需 Lv.3+ 裝備
- 位置 (7, 7) 在中段路徑上，玩家領路有所預期
