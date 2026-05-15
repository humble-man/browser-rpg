# 提案 Intent — NPC dialog system

## 這是什麼

在地圖上新增 NPC tile（人物站點），玩家走過去自動觸發對話 modal：
- 顯示 NPC 名稱 + 1 句或多句台詞
- 點擊或按 Enter 推進下一句
- 最後一句後關閉，回 overworld

第一輪在碧楓村放 2-3 個 NPC：
- 村長：歡迎玩家、給世界 lore
- 旅店老闆：給操作 hint
- 神秘冒險者：暗示迷宮深處有東西

## 為誰而做

- **新玩家**：從 NPC 對話得到「為什麼要去迷宮」的動機
- **想探索世界的玩家**：對話傳遞 lore 和氛圍
- **未來內容**：對話系統是 quest / branching choice / NPC shop 的基礎
- **作者**：練習 data-driven dialog + scene transition

## 解決什麼問題

`docs/design.md` 從 cycle 1 就規劃了「NPC 對話」但留作 future work。cycle 5 擴大地圖時又承諾留給後續 cycle。
目前玩家走進村莊只看到 shop / inn / dungeon entry，**世界沒有「人」**。
加上 NPC 對話讓村莊從「機能集合」變成「有人住的地方」。

## 範圈

- ✅ 新 tile type：`npc`
- ✅ 2-3 個 NPC 在碧楓村
- ✅ Dialog data 集中放 `data/dialogues.ts`
- ✅ 新 DialogModal 元件（線性多句、點擊推進、最後關閉）
- ✅ 走進 npc tile 自動觸發（同 shop 模式）
- ❌ 不做分支選擇（cycle 11）
- ❌ 不做 quest 系統（cycle 11+）
- ❌ 不做 NPC 商店 / 兌換（cycle 11+）
- ❌ 不做對話頭像 / 立繪（依賴 #7 美術素材）
- ❌ 不改既有遊戲邏輯
