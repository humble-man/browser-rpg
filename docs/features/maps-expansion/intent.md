# 提案 Intent — Maps expansion + treasure chests

## 這是什麼

把 MVP 的兩張地圖擴展到 design 規格尺寸，並加入第一種新互動 tile — **寶箱**。

- 碧楓村：**10×8 → 12×10**（+ 24 格活動空間）
- 幽影迷宮：**10×8 → 15×12**（+ 100 格活動空間）
- 新 tile：**寶箱**，首次互動給定道具、之後變成空寶箱

## 為誰而做

- **重複遊玩的玩家**：地圖小走完 10 分鐘就破關了，擴大後初次遊玩體感更接近完整 RPG
- **想探索的玩家**：寶箱獎勵增加「離開主路探索」的動機
- **未來內容**：留下空間給 cycle 6 加 NPC / 二商店 / mini-boss / 隱藏房

## 解決什麼問題

`docs/design.md` §5 規格寫「10×10 ~ 15×15 tile」，cycle 1 MVP 為了速度先做 10×8。
Cycle 5 補上 design 承諾，並引入一種「玩家會主動繞路尋找」的內容 — 寶箱。

## 範圈

- ✅ 兩張地圖尺寸擴大到 spec
- ✅ 新 tile type：`treasure`
- ✅ 寶箱資料 data-driven（地圖內標記 + 內容物列在 maps.ts）
- ✅ 寶箱開過一次的旗標寫入 `flags`（已存在於 store）→ save/load 支援
- ✅ 戰鬥 / 商店 / 順序 / AI / lock 全不動
- ❌ 不加 NPC 對話系統（留 cycle 6）
- ❌ 不加第二個商店（留 cycle 6）
- ❌ 不加 mini-boss（留 cycle 6）
- ❌ 不加隱藏房 / 機關（留 cycle 6+）
- ❌ 不改既有戰鬥 / AI / 順序邏輯
