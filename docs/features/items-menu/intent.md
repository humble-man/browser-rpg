# 提案 Intent — Use consumables outside battle

## 這是什麼

把「使用道具」（補血藥水 / 魔力藥水 / 解毒劑）從只能在戰鬥中操作，
擴展為**任何時候都能在 ESC 系統選單裡操作**。

新增獨立的 ItemsModal：
- 列 inventory 中 consumable 類道具
- 點「使用」即套用效果（heal / restoreMp / cure）並消耗

## 為誰而做

- **低血玩家**：地圖上想預先補滿、避免下場戰鬥開局就掛
- **想存藥水帶到戰場前的玩家**：戰前評估手上有多少補給
- **未來內容**：cycle 6+ 加更多道具（解毒劑用於 status effects）需要這個入口

## 解決什麼問題

UX 漏洞：cycle 1 把消耗道具的使用挨在戰鬥選單。但 RPG 直覺上，補品應該地圖、戰鬥、選單都能用。
跟 cycle 8 修裝備是同類問題 — 「inventory 上的東西，使用入口應該在 inventory，不是場景限定」。

## 範圈

- ✅ ESC 選單加「🧪 道具」按鈕
- ✅ 新 ItemsModal 元件
- ✅ 新 store action `useItem(itemId)` 處理非戰鬥使用
- ✅ heal / restoreMp / cure 三種效果套用（複用 `applyConsumable`）
- ❌ 不改戰鬥中的道具使用流程（cycle 1 的 playerAct('item', id) 仍運作）
- ❌ 不加「合併使用多個」「批次使用」等高階 UX
- ❌ 不改 inventory 結構
- ❌ 不加新道具種類
