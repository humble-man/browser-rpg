# 設計 Design — Equipment menu outside shop

## 1. 新元件 `src/ui/EquipModal.tsx`

讀 `player.equipment` (weapon / armor) 與 inventory 中的 weapon/armor 類道具。
複用既有 `.modal-backdrop` / `.modal-card` / `.shop-row` / `.empty-inv` 樣式。

接口：
```typescript
interface Props {
  onClose: () => void;
}
```

## 2. `Overworld.tsx` 變動

### 2.1 加 state

```tsx
const [showEquip, setShowEquip] = useState(false);
```

### 2.2 ESC 選單加裝備按鈕

順序：🎒 裝備 → 💾 存檔 → 📤 匯出 → 關閉 → ↩ 回標題

### 2.3 render EquipModal

```tsx
{showEquip && <EquipModal onClose={() => setShowEquip(false)} />}
```

### 2.4 鍵盤處理

`if (showEquip) return;` 加在 onKey 內面，避免在 modal 開時背景移動。

## 3. CSS

`.equip-modal`, `.equip-current`, `.equip-slot`, `.equip-slot-label`, `.equip-slot-value`, `.equip-bonus`, `.equip-list-title`, `.equip-list`。

## 4. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `core/store.ts` | equipItem 已存在 |
| `systems/inventory.ts` | equip 邏輯不變 |
| `scenes/Shop.tsx` | 商店 equip tab 維持 |
| `scenes/Battle.tsx` / 其他 | 不涉及 |
| data / maps | 不影響 |

## 5. 驗證計畫

新遊戲 → 走到村莊寶箱 (7, 7) 拾鐵劍 → ESC → 點 🎒 裝備 → 點裝備 → 確認 ATK 9 → 17 (+8)。

### 回歸測試

- Cycle 1：商店 equip tab 仍可用
- Cycle 4：lock 不受影響
- Cycle 5：寶箱拾取 + 自動存檔
- Cycle 6/7：PWA / deploy 不影響

## 6. 風險

- **狀態觸發 re-render**：immer middleware 已處理
- **z-index 衝突**：EquipModal z=100（同 shop），不同時出現
- **平衡風險**：純 UI 改動，equip 邏輯不變
