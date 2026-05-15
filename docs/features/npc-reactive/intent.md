# 提案 Intent — Reactive NPC dialog

## 這是什麼

讓村莊另外兩個 NPC（神秘冒險者、旅店老闆娘）的對話依玩家進度動態切換，
跟 cycle 11 村長 quest dialog 一樣的 pattern，但**無新任務 / 無獎勵**。

### 神秘冒險者 (8, 4)

- **預設**：「⋯你也是來挑戰迷宮的？」（4 句警告 boss）
- **mini-boss 擊敗後**：「迷霧獵手⋯你做到了？真厲害。再深處就是龍了，多多保重。」
- **boss 擊敗後**：「⋯你居然連幽魂龍都打倒了。我比不上你。」

### 旅店老闆娘 (3, 6)

- **預設**：「累了嗎？旅館一晚 10 金幣⋯」+ ESC hint
- **領完村長獎勵後**：「村長今天可開心了，多虧你呢。要不要住一晚？」

## 為誰而做

- **完成 milestone 的玩家**：世界記得你做了什麼，narrative reactive
- **想探索 dialogue 變化的玩家**：每次擊敗 mini-boss / boss / 領獎都回村跟 NPC 講話
- **未來 quest 系統**：reactive dialog pattern 可作 multi-NPC quest 的基礎

## 解決什麼問題

Cycle 11 只給村長 4 階段 dialog。其他 2 個 NPC 無論玩家進度都說同一句話。
玩家擊敗 boss 後回村，神秘冒險者還在說「沒等級五以上別硬上」— 違和。
本 cycle 補上 2 個 NPC 的 reactive dialog，讓世界感覺活。

## 範圈

- ✅ 神秘冒險者：3 個 dialog 變體（預設 / mini-boss 擊敗 / boss 擊敗）
- ✅ 旅店老闆娘：2 個 dialog 變體（預設 / 村長領獎後）
- ✅ 複用 `pickElderLines` pattern，每個 NPC 自己的 helper 函式
- ✅ 觸發點同樣在 `movePlayer` npc 分支
- ❌ 不加新 quest（無 accept-quest 選項，純 reactive lore）
- ❌ 不加獎勵（已領獎或無獎）
- ❌ 不做 multi-quest framework refactor（留 cycle 16+）
- ❌ 不改既有村長 quest
