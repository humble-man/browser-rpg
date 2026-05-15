# 設計 Design — NPC dialog system

## 1. Types

```typescript
export type TileType = ... | 'npc';
export interface DialogLine { speaker: string; text: string; }
export interface NpcData { name: string; emoji: string; lines: DialogLine[]; }
export interface ActiveDialog { npc: NpcData; lineIndex: number; }
export interface GameMap {
  // ...existing
  npcs?: Record<string, NpcData>;
}
```

## 2. `data/maps.ts` 變動

### 2.1 GLYPH 加 `'N'`

### 2.2 碧楓村地圖加 3 個 N

```
row 2 → N(2,2) 村長
row 4 → N(8,4) 神秘冒險者
row 6 → N(3,6) 旅店老闆娘
```

### 2.3 內嵌 `npcs` 物件（3 NPCs × 各自 2-4 句台詞）

見 implementation diff。

## 3. Store 變動

- `activeDialog: ActiveDialog | null` state
- `movePlayer` 加 npc 分支：set activeDialog
- 新 `advanceDialog()` action：lineIndex++ 或 重置為 null

## 4. 新元件 `src/ui/DialogModal.tsx`

- 讀 activeDialog state
- header: emoji + name
- body: text（CSS white-space: pre-line）
- footer: 「▶ 下一句」或「關閉」（最後一句）
- Enter / Space 鍵盤推進

## 5. `Overworld.tsx` 變動

- TILE_GLYPH 讀 npc 時查 `MAPS[mapId].npcs?.["x,y"]` 取 emoji
- 鍵盤 onKey 加 `if (activeDialog) return;`
- render `<DialogModal />`

## 6. CSS

`.tile-npc` 背景 + `.dialog-modal` / `.dialog-speaker` / `.dialog-emoji` / `.dialog-name` / `.dialog-text` / `.dialog-hint`。

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `core/save.ts` | activeDialog 不入 save（transient）|
| `scenes/Battle.tsx` / `Shop.tsx` / `Title.tsx` / `GameOver.tsx` | 與 NPC 無關 |
| `systems/*` | 不涉及 |
| `BattleState` 等 type | 不改 |

## 8. 驗證計畫

見 PR 評論：3 個 NPC 都走一遍 、鍵盤 / 點擊推進、Enter/Space 推進、對話中不能移動。

### 回歸測試

Cycle 1-9 全功能保留。

## 9. 風險

- z-index 互斥出現無衝突
- activeDialog 不入 save，reload 不卡
- NPC 字數內嵌 maps.ts OK
