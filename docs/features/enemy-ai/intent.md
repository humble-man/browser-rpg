# 提案 Intent — Enemy AI tactics

## 這是什麼

把 boss（幽魂龍）的行為從「永遠物理攻擊」升級為**規則式 AI**：
- HP 充足時 → 普通攻擊或火球
- HP < 30% 時 → 使用補血藥水
- MP 充足且玩家 HP 高時 → 偶爾施放火球

普通怪（slime / goblin / skeleton / spider）**維持單純攻擊**。

## 為誰而做

- **挑戰 boss 的玩家**：boss 戰能感受到「對手在思考」，補品消耗變得策略性
- **未來內容**：v0.3+ 加更多 boss 時，AI 框架已就緒
- **作者**：練習在 data-driven JSON 設計 AI tactics 表

## 解決什麼問題

`docs/design.md` §4.2 規格寫「HP < 30% 用補品、否則攻擊最低 HP」，
MVP / cycle 1 / cycle 2 都簡化為「永遠攻擊」。Cycle 3 補上 boss 的智能行為，
讓戰鬥體驗在量（更多血更多招）之外，有質（對手會反應）的提升。

## 範圈

- ✅ Boss (dragon) 的 AI tactics + 補品池 + 技能池
- ✅ AI 決策邏輯抽成 `systems/enemy-ai.ts` 模組
- ✅ `monsters.json` 加 `ai` 欄位（optional），普通怪不寫 = 沿用攻擊
- ❌ 不改隊伍 / 多目標 AI（v0.3）
- ❌ 不做 buff/debuff、status effects（v0.3+）
- ❌ 不改傷害公式
- ❌ 不改順序系統（cycle 2 已完成）
