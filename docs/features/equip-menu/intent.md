# 提案 Intent — Equipment menu outside shop

## 這是什麼

把「裝備」機能從只能在商店裡操作，擴展為**任何時候都能在 ESC 系統選單裡操作**。

新增一個獨立的 Equipment Modal：
- 顯示當前裝備（weapon / armor 兩槽）
- 列出 inventory 內的 weapon / armor 類道具
- 點擊即可裝備（與 shop 一致的 swap 行為）

## 為誰而做

- **拾到裝備的玩家**：cycle 5 寶箱會給鐵劍，玩家當下需要立即裝備
- **戰前準備的玩家**：進戰鬥前快速檢查裝備狀態
- **未來內容**：cycle 6+ 可能加更多裝備來源（mini-boss 掉落、quest 獎勵），都需要這個入口

## 解決什麼問題

UX 漏洞：cycle 1 把 equip 邏輯挨在商店（買賣裝備順帶裝備合理），但 cycle 5 寶箱開始給武器後，玩家在商店外取得的裝備找不到入口操作。實機玩家立刻撞上這個障礙。

## 範圈

- ✅ ESC 選單加「🎒 裝備」按鈕
- ✅ 新 EquipModal 元件
- ✅ 複用 store 的 `equipItem` action（不改邏輯）
- ✅ 顯示當前 equipment 槽位 + 加成
- ❌ 不改 equip 計算 / 切換邏輯
- ❌ 不加 unequip 按鈕（換裝即等於 unequip 舊裝備）
- ❌ 不改商店 UI（商店裝備 tab 維持作為購買後立即裝備的入口）
- ❌ 不做拖曳 / 動畫等高級 UX
