# 分析 Analysis — Equipment menu outside shop

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 拾到鐵劍後 | ESC → 點 🎒 裝備 → 看到鐵劍可裝備 → 點裝備 → ATK +8 訊息 |
| 想換武器 | ESC → 🎒 裝備 → 點新武器 → 舊武器回 inventory |
| 想看當前裝備 | ESC → 🎒 裝備 → 上半顯示「武器：🗡️ 鐵劍 ATK+8」 |
| 沒有可裝備道具 | Modal 內顯示「尚無可裝備的道具」 |

## 2. UI 結構（EquipModal）

- header：🎒 裝備 標題
- 上半：目前裝備（weapon / armor 兩槽位 + bonus）
- 下半：持有道具（weapon / armor 類列表 + 「裝備」鈕）
- footer：關閉鈕

## 3. ESC 系統選單調整

在「存檔」之上加「🎒 裝備」選項（最常用優先）。項目順序：

1. 🎒 裝備 (新增)
2. 💾 存檔
3. 📤 匯出存檔
4. 關閉
5. ↩ 回到標題

## 4. 狀態管理

`Overworld.tsx` 加 `showEquip: boolean` 與 `showMenu` 平行。

流程：
- ESC → `showMenu = true`
- 點 🎒 裝備 → `showMenu = false`, `showEquip = true`
- EquipModal 關閉 → `showEquip = false`（回 overworld，**不**回系統選單）

## 5. 邊界案例

- **戰鬥中 ESC**：戰鬥場景沒有 ESC 處理 → 不受影響
- **商店中 ESC**：Overworld useEffect 有 `if (shopOpen) return;` → ESC 被擋
- **同名重複道具**：inventory 用 `{ itemId, count }` 表，addItem/removeItem 自動處理 count 累計
- **裝備後重複點同一項**：Shop 同邏輯 — disabled 狀態避免 no-op click

## 6. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/scenes/Overworld.tsx` | 加 `showEquip` state + ESC 選單按鈕 + render `<EquipModal>` |
| `src/ui/EquipModal.tsx` | **新檔** Equipment modal |
| `src/index.css` | 可選加 `.equip-modal` 樣式（多半複用既有 modal class）|
| `src/core/store.ts` | **不動**（equipItem 已存在）|
| `src/scenes/Shop.tsx` | **不動**（保留商店 equip tab）|
| `src/systems/inventory.ts` | **不動** |

## 7. 約束

- 複用既有 modal 樣式
- 不破壞商店 equip 流程，兩個入口共用 store action
- ESC menu 保持簡潔（5 個按鈕為極限）
- 時間預算：~30 min 實作 + 15 min 驗證

## 8. 風險

- **z-index 衝突**：EquipModal 用 z=100（同 shop）；lock modal z=200（不同時架出現）
- **狀態同步**：immer middleware 正確觸發 re-render
- **加成重算**：equipItem 負責正確處理 swap
