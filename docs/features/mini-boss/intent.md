# 提案 Intent — Dungeon mini-boss

## 這是什麼

在幽影迷宮中段加一個 mini-boss tile，固定位置、踩上去觸發戰鬥。
擊敗後 flag 持久化（同 boss tile），可掉落較稀有的獎勵（一次性）。

新怪物：**「迷霧獵手」**（暫定名），介於普通怪與最終 boss 之間的強度：
- HP 80（介於小怪 30-75 與龍 180）
- ATK 14、DEF 7、SPD 6
- 獎勵 XP 80、Gold 50（普通怪約 10-25，龍是 250）
- 100% 掉落 1 個皮甲（玩家可裝備）
- 一次性，flag `mini-boss-defeated`

## 為誰而做

- **過早打到龍被秒殺的玩家**：mini-boss 是中段門檻，活著過就知道自己準備好了沒
- **想完整打迷宮的玩家**：多一個 boss-tier 戰鬥 = 多一個 milestone
- **未來內容**：drop 的皮甲可作後續 quest 物件

## 解決什麼問題

迷宮路徑當前 = 一般遇敵 → boss。沒有「啊我打到 mini-boss 了，要小心」這種感覺。
本 cycle 加一個固定位置、強度中等的 mini-boss 戰，補上 RPG 經典「mid-dungeon checkpoint」體驗。

## 範圈

- ✅ 新 tile type：`mini-boss`
- ✅ 新怪物：迷霧獵手（monsters.json）
- ✅ 迷宮地圖加 1 個 M tile
- ✅ flag `mini-boss-defeated` 追蹤 + 防重複觸發
- ✅ 戰勝獎勵：固定掉 leather-armor + 高 XP/Gold
- ✅ 自動存檔
- ❌ 不加 mini-boss 對應 quest（cycle 13+）
- ❌ 不改 NPC 對話 hint（保留接口）
- ❌ 不加新地圖 / 第二迷宮
- ❌ 不改既有 boss / 平衡
- ❌ 不做戰鬥 cutscene / 特殊 BGM
