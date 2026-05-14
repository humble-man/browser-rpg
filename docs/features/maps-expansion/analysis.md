# 分析 Analysis — Maps expansion + treasure chests

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 新玩家進村 | 12×10 的更大村莊，shop/inn/dungeon entry 仍能輕易找到 |
| 玩家走進地下迷宮 | 15×12 的迷宮，要走更多步抵達 boss，途中可能遇 ~3 場戰鬥 |
| 玩家路過寶箱 | 走到寶箱 tile → 自動觸發 → 「📦 拾獲補血藥水 ×2」 |
| 玩家回頭走過已開寶箱 | tile 顯示 📯（空），log 無事件 |
| 玩家存檔→重整→載入 | 已開寶箱仍為空（flag 持久化）|
| 既有 save migration | flags 中無 treasure key → 預設未開啓 |

## 2. 資料模型

### 2.1 新 tile type

```typescript
type TileType = ... | 'treasure';
```

map.ts 的 GLYPH 加：`'T': 'treasure'`

### 2.2 寶箱內容

每個 GameMap 加 optional `treasures`：

```typescript
interface TreasureContent {
  itemId: string;
  count: number;
}

interface GameMap {
  // ...existing
  treasures?: Record<string, TreasureContent>;  // key = "x,y"
}
```

### 2.3 旗標 key

`flags['treasure-${mapId}-${x}-${y}'] = true` → 已開啓

`flags` 已存在於 player save，自動 persist via existing save.ts。

## 3. 地圖佈局設計

### 3.1 碧楓村 12×10

- spawn 改為 (5, 4) 維持村中央
- S(6, 2) shop、I(4, 5) inn、T(7, 7) 寶箱、D(10, 8) dungeon entry
- 1 個寶箱 → iron-sword ×1（給 cycle 1 玩家免費武器入場）

### 3.2 幽影迷宮 15×12

- spawn (2, 1) 旁 E(1, 1) exit
- 2 個寶箱：T(11, 5) potion ×3、T(12, 8) ether ×2
- B(12, 10) boss 移到更深處

## 4. 邊界案例

- **道具堆疊**：寶箱給的 itemId 若已在 inventory，count 累加（`addItem` 已正確處理）
- **補幾類寶箱**：iron-sword 是 weapon 類；給 player.inventory（玩家自己決定何時 equip）
- **重複進入同 tile**：第二次踩到 → 看 flag → 顯示「📯 空寶箱」 + 不給道具
- **存檔遷移**：舊存檔 `flags` 為 `{}` → 所有 treasure 預設未開啓 → 拿到即可。**Backward compatible**。
- **舊玩家 wall 位置**：舊存檔 player.position 若在新地圖 wall 上會卡住。**緩解**：load 後檢查，如在 wall 自動回 spawn。

## 5. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/core/types.ts` | TileType += 'treasure'；GameMap.treasures?；TreasureContent |
| `src/data/maps.ts` | 重畫兩張地圖 + treasures 對應；GLYPH += 'T' |
| `src/core/store.ts:movePlayer` | 加 treasure tile 觸發邏輯 |
| `src/core/store.ts:loadGame` | wall 位置救援 |
| `src/scenes/Overworld.tsx` | TILE_GLYPH 加；寶箱動態顯示 📦/📯 |
| `src/index.css` | `.tile-treasure` 樣式 |

不動：
- 戰鬥相關全部
- 商店、旅館
- Shop / GameOver / Title / Battle scenes
- session lock
- Enemy AI

## 6. 約束

- **存檔向下相容**：舊 save 的 flags 不含 treasure key，預設未開啓
- **map size 增加渲染負擔**：村莊 120 + 迷宮 180 個 div，正常 PC 渲染無壓力
- **bundle 大小**：地圖資料體積增加，估 +2KB unmin
- **遊戲平衡**：寶箱給的道具不該讓玩家輕鬆破關 — iron-sword 已是商店有的、potion 是消耗品，無破壞性

## 7. 風險

- **地圖路徑可達性**：15×12 加牆壁後可能有玩家走不到的死路。**驗證階段**手動跑一遍確認從 spawn 能到 boss + 每個寶箱
- **encounter 平均次數變多**：18% rate × 走 20 步 ≈ 3.6 encounters。可能變太累。**緩解**：保持01‘8%，觀察驗證階段體感，若太多再調
- **既有玩家位置在新地圖**：舊 save 的 player.position 若在新地圖 wall 上會卡住。**緩解**：load 後若 player 在 wall，自動回 spawn

## 8. 時間預算

- 重畫兩張地圖：30 min
- types + GLYPH + treasures：15 min
- movePlayer 加 treasure 分支：15 min
- Overworld.tsx 更新：15 min
- CSS：10 min
- 驗證：30 min

**合計 ~2 hr**
