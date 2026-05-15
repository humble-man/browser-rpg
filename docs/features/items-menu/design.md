# 設計 Design — Use consumables outside battle

## 1. 新元件 `src/ui/ItemsModal.tsx`

讀 inventory 中 consumable 類道具、點「使用」呼叫 `useItem` action。
EFFECT_ICON map：heal=💊 / restoreMp=💧 / cure=🧪。
複用 `.shop-row` / `.empty-inv` / `.modal-card` 樣式。

## 2. Store 新 action `useItem`

```typescript
useItem: (itemId: string) => void;

useItem: (itemId: string) => {
  const item = getItem(itemId);
  if (!item || item.type !== 'consumable') return;
  if (countOf(get().player, itemId) <= 0) return;
  set(s => {
    const desc = applyConsumable(s.player, itemId);
    if (!desc) return;
    removeItem(s.player, itemId, 1);
    s.messages.push(`🧪 使用「${item.name}」 — ${desc}`);
  });
},
```

複用 systems/inventory.ts 的 applyConsumable / removeItem / getItem / countOf。

## 3. `Overworld.tsx` 變動

- 加 `showItems` state
- 鍵盤 guard `if (showItems) return;`
- ESC 選單加「🧪 道具」按鈕（🎒 裝備之下）
- render `{showItems && <ItemsModal onClose={() => setShowItems(false)} />}`

## 4. CSS

`.items-modal` + `.items-list`。

## 5. 不動的部分

| 模組 | 為何不動 |
|---|---|
| systems/inventory.ts | applyConsumable / removeItem / getItem / countOf 已備齊 |
| scenes/Battle.tsx | 戰鬥道具使用 (playerAct('item', id)) 保留 |
| scenes/Shop.tsx | 不動 |
| core/types.ts | 不需新型別 |

## 6. 驗證計畫

見 PR 評論：新遊戲 → 戰鬥扣血 → ESC → 🧪 道具 → 點補血 → HP 增加 、 count 減 1。

## 7. 風險

- immer 狀態同步 OK
- z-index 共存無衝突
- 平衡仍合理（inn 10G 仍是補滿最便宜）
