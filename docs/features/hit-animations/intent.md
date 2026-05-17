# 提案 Intent — Battle hit animations

## 這是什麼

戰鬥畫面命中瞬間的 sprite 反應動畫，補齊 SE（cycle 14）+ damage numbers（cycle 16）+ BGM（cycle 19）已有的打擊感堆疊。具體加四件：

- **Attacker lunge**：攻擊方往防守方輕微位移再彈回（~250ms），讓「誰打誰」一眼可見
- **Hit flash**：命中瞬間在受擊方 sprite 疊一層紅色閃光（damage）或綠色閃光（heal）
- **Crit emphasis**：爆擊時 shake 幅度加倍 + flash 更亮 + 受擊方 brief scale-up
- **Defeat fade**：enemy 戰敗時 sprite 淡出 + 下沉；player 戰敗時亦同

純 CSS keyframes 驅動，零 JS 動畫庫依賴。

## 為誰而做

- **戰鬥中的玩家**：補上「打擊感」最後一塊—攻擊端動作 + 命中閃光，讓回合更有衝擊力
- **配合既有 stack**：SE 聽得到、damage number 看得到，但角色本身（除了受擊 shake）仍是靜止的
- **作者**：練習 CSS animation orchestration + 與 React state 同步觸發

## 解決什麼問題

目前戰鬥的視覺回饋集中在「受擊方」（shake + 浮動數字）。**攻擊方完全沒動作**—感覺像「靜止的角色 + 飛出的數字」。新加 lunge + flash 後，每次攻擊變成「攻擊方衝刺 → 受擊方紅閃 + 抖動 + 飛數字」的完整序列，與經典 JRPG 命中表演對齊。

## 範圈

- ✅ Attacker lunge（player 攻擊 enemy、enemy 攻擊 player 兩向）
- ✅ Hit flash（紅色 damage / 綠色 heal）
- ✅ Crit emphasis（shake×2 + flash 更亮 + scale 短暫放大）
- ✅ Defeat fade（enemy on won、player on lost）
- ✅ 與既有 shake / floating number / SE 時序對齊（不重寫，疊加）
- ❌ 不改既有 `combatant.shake` keyframes（沿用）
- ❌ 不加全螢幕 shake（過度，留 future）
- ❌ 不加粒子 / sparkle / 屏閃 等特效
- ❌ 不加 low-HP pulse / poison tint 等 status 視覺（不同 scope）
- ❌ 不動 store / save / battle 邏輯 / SE / damage numbers
- ❌ 不依賴外部素材或動畫庫（純 CSS）
