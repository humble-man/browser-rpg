# 提案 Intent — Single quest from the village elder

## 這是什麼

把碧楓村村長的對話從「單向 lore」升級為「可接的任務」：

1. 第一次見村長：說明情況 + 「接受任務」按鈕
2. 任務中：「辛苦了，幽魂龍解決了嗎？」
3. 打敗 boss 後再見村長：「你做到了！」+ 獎勵 (500G)
4. 領完獎：「謝謝你，碧楓村得救了。」

整個對話狀態用 `flags` 三個布林記錄：`quest-elder-accepted` / `quest-elder-completed` / `quest-elder-rewarded`。
不引入完整 quest log，保持極簡。

## 為誰而做

- **想知道為什麼要打 boss 的玩家**：接任務後有明確目標 + 獎勵
- **走完故事的玩家**：narrative loop 完整（接 → 做 → 報告）
- **未來 quest 系統的基礎**：cycle 12+ 加多任務時可抽 quest 為獨立 module

## 解決什麼問題

Cycle 10 加 NPC 對話讓村莊有了人，但對話純單向 — 玩家無法回應。
本 cycle 加「接受任務」這個玩家動作 + 任務狀態追蹤，
讓 NPC 與玩家形成「對話 → 行動 → 對話」的最小 RPG 循環。

## 範圈

- ✅ 村長對話加分支選項：接受 / 拒絕
- ✅ 任務狀態三階段（accepted → completed → rewarded）用 flags 追蹤
- ✅ 打敗 boss 自動 mark `quest-elder-completed`
- ✅ 領獎邏輯：+500G + 自動存檔
- ✅ 對話內容依狀態切換（store 動態選 npc.lines）
- ❌ 不做完整 quest log UI（cycle 12+）
- ❌ 不加多任務 / 並行任務（cycle 12+）
- ❌ 不改其他 NPC（旅店、冒險者保持靜態）
- ❌ 不加 quest item（如「找回村長的徽章」這種收集型）
