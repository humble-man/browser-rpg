# 分析 Analysis — Use consumables outside battle

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| HP 低於 50% | ESC → 🧪 道具 → 點補血藥水「使用」→ HP +30、count -1 |
| MP 用完 | ESC → 🧪 道具 → 點魔力藥水「使用」→ MP +20 |
| 無 consumable | Modal 顯示「無可用道具」 |
| 同款道具 ×3 | 列表顯示「× 3」、可連點使用至×0 後消失 |
| HP/MP 已滿時用 heal | 訊息「回復 0 HP/MP」（amount clamped to maxHp）|
| 戰鬥中的道具使用 | 不變，仍走 `playerAct('item', id)` |

## 2. UI 結構

複用 .shop-row / .empty-inv / .modal-card。可選加 .items-modal max-width 微調。

## 3. ESC 選單調整

順序：裝備 → 道具（新）→ 存檔 → 匯出 → 關閉 → 回標題。6 個上限。

## 4. 狀態管理

`Overworld.tsx` 加 `showItems` 與 `showMenu` / `showEquip` 平行。

流程同 cycle 8：ESC → menu → 點道具 → menu 關 + items modal 開。

## 5. Store 新 action

`useItem(itemId)`：複用 systems/inventory.ts 的 `applyConsumable` + `removeItem`。
推記訊息、不介入戰鬥 phase。

## 6. 邊界案例

- **HP/MP 已滿**：applyConsumable 已 clamp → 訊息「回復 0」，不阻止使用
- **count = 0**：useItem 內守衛；UI 不顯示 count=0 道具
- **戰鬥中 ESC**：Battle scene 未掛 ESC → 不受影響
- **商店開啟**：shopOpen 擋 ESC
- **同款多筆 inventory**：addItem 自動合併為單 slot
- **解毒劑 (cure)**：現 data 設為 heal 999（緊急回血），文字「狀態已淨化」不準。**不在本 cycle 修改**，留 cycle 10

## 7. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/ui/ItemsModal.tsx` | **新檔** |
| `src/scenes/Overworld.tsx` | 加 `showItems` + ESC 選單 + render + 鍵盤 guard |
| `src/core/store.ts` | 加 `useItem(itemId)` action |
| `src/index.css` | 可選加 `.items-modal` |
| `src/systems/inventory.ts` | **不動** (applyConsumable 已存在) |
| `src/scenes/Battle.tsx` | **不動** (戰鬥道具流程保留) |

## 8. 約束

- 複用 applyConsumable
- 不影響戰鬥流程
- ESC menu 6 個按鈕為上限
- 時間預算：~30 min 實作 + 15 min 驗證

## 9. 風險

- **狀態同步**：immer 處理妥當
- **z-index 衝突**：items / equip / shop modal 都 z=100，不同時出現
- **平衡**：玩家現在能在地圖上滿血，補品變得更有價值 — 透過旅館 vs 藥水的成本 trade-off 仍平衡（10G inn 补滿 vs 20G 藥水 +30 HP）
