# 分析 Analysis — NPC dialog system

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 玩家進村看到 NPC | 地圖顯示 emoji（👴 👩‍🍳 🧙‍♂️）|
| 走到 NPC tile | 自動開啟 DialogModal，顯示「村長：歡迎來到...」 |
| 點「下一句」 | 顯示第二句 |
| 點到最後一句 | 按鈕變「關閉」，點擊回 overworld |
| 重複走過 NPC | 對話再次觸發（不消耗、無 flag）|
| 不同 NPC | 顯示各自的台詞 |

## 2. 資料模型

```typescript
type TileType = ... | 'npc';

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface NpcData {
  name: string;
  emoji: string;
  lines: DialogLine[];
}

export interface GameMap {
  // ...existing
  npcs?: Record<string, NpcData>;
}
```

## 3. 碧楓村 NPC 配置

| Tile | 位置 | NPC | Emoji |
|---|---|---|---|
| N | (2, 2) | 村長 | 👴 |
| N | (3, 6) | 旅店老闆娘 | 👩‍🍳 |
| N | (8, 4) | 神秘冒險者 | 🧙‍♂️ |

spawn 在 (5, 4)，玩家不會初始撞上 NPC。

## 4. 對話內容草稿

**村長 (2, 2)**:
1.「歡迎來到碧楓村，年輕的冒險者。」
2.「最近村南的幽影迷宮鬧出怪事⋯野獸增加、夜裡有奇怪聲響。」
3.「若你願意幫忙調查，全村都會感謝你。」

**旅店老闆娘 (3, 6)**:
1.「累了嗎？旅館一晚 10 金幣，包你 HP / MP 全滿。」
2.「對了，按 ESC 可以打開系統選單，存檔別忘了。」

**神秘冒險者 (8, 4)**:
1.「⋯你也是來挑戰迷宮的？」
2.「迷宮深處有頭幽魂龍，比一般怪強得多。」
3.「沒等級五以上、沒鐵劍皮甲，最好別硬上。」
4.「⋯祝你好運。」

## 5. UI 結構（DialogModal）

header: emoji + 名稱
body: 當前句台詞（white-space: pre-line 允許換行）
footer: 「▶ 下一句」（最後變「關閉」）

## 6. 移動與觸發流程

`movePlayer` 在 tile 觸發邏輯插入 npc 分支，讀 npc data 設 activeDialog state。
Store 新 `activeDialog: { npc, lineIndex } | null` + `advanceDialog()` action。

## 7. 邊界案例

- **走離後再走回**：dialog 再次觸發（純無狀態）
- **戰鬥中**：戰鬥場景沒走動，不會觸發
- **多分頁 lock 開啟**：lock modal z=200 蓋過 dialog z=100
- **存檔載入後**：activeDialog 不入 save，新 session 不會卡在某對話中間
- **按鈕重複點**：每點推進 lineIndex，到最後句後關閉

## 8. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/core/types.ts` | TileType += `'npc'`、`DialogLine`、`NpcData`、`GameMap.npcs?` |
| `src/data/maps.ts` | GLYPH += `'N'`、村莊地圖加 3 個 N、內嵌 npcs 物件 |
| `src/core/store.ts` | 加 `activeDialog` state + `advanceDialog` action + `movePlayer` npc 分支 |
| `src/scenes/Overworld.tsx` | TILE_GLYPH 加 npc 動態狺取 + render `<DialogModal>` + 鍵盤 guard |
| `src/ui/DialogModal.tsx` | **新檔** |
| `src/index.css` | 加 `.tile-npc` + `.dialog-modal` |

## 9. 約束

- **activeDialog 不入 save**（transient）
- **鍵盤 guard**：dialog 開時 ESC / 方向鍵不作用
- **時間預算**：~1.5 hr 實作 + 30 min 驗證

## 10. 風險

- **dialogue 文字位置**：內嵌 maps.ts 已足（3 NPCs × 幾句）；未來句數爆炸再抽出
- **multi-line text**：CSS `white-space: pre-line` 處理換行
- **NPC tile walkable**：玩家踩上即該位置（同 shop）
- **z-index**：dialog 100，與 shop/equip/items 不同時出現
