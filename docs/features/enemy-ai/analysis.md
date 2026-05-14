# 分析 Analysis — Enemy AI tactics

## 1. 使用情境

| 玩家觀察 | Boss 行為 |
|---|---|
| Boss 滿血 (180/180) | 普攻 70% / 火球 30% |
| Boss HP 60% | 普攻 70% / 火球 30% |
| Boss HP 25%（< 30% threshold）| 嘗試補血藥水 → 若無補品則 fallback |
| 補品用完 + 低血 | 普攻或火球（看 MP）|
| MP 用完 | 只能普攻 |

## 2. 決策樹

```
chooseEnemyAction(enemy, battle, player):
  if enemy.currentHp / enemy.maxHp < 0.3 AND ai.items 有可用 consumable:
    return { type: 'item', itemId: <第一個可用 consumable> }
  
  if 'fireball' in ai.skills AND enemy.currentMp >= fireball.mpCost AND chance(0.3):
    return { type: 'skill', skillId: 'fireball' }
  
  return { type: 'attack' }
```

簡化原則：
- 單一 HP threshold（30%）
- 火球機率 30%（避免過度可預測、平衡傷害輸出）
- AI 不挑「最佳道具」，照 pool 順序用第一個

## 3. 邊界案例

- **無限循環風險**：補血後 HP > 30%，下回合進入攻擊分支。可終止。
- **補品池耗盡**：低血 + 無補品 → 自動 fallback 到攻擊/火球。
- **MP 不足**：fireball 分支自動跳過。最後一定走到 attack（永遠可執行）。
- **連續補血**：每回合若 HP 仍 < 30% 持續補。期望行為（戰術合理）。
- **狀態同步**：enemyAct 內讀取 battle.enemyCurrentHp 而非 enemy.hp（這是滿血基準）。

## 4. 與既有系統的接點

| 模組 | 變動類型 |
|---|---|
| `data/monsters.json` | 為 `dragon` 加 `ai` 欄位（optional）|
| `core/types.ts` | 加 `EnemyAI`, `EnemyActionIntent` types；`Monster` 加 `ai?: EnemyAI` |
| `systems/enemy-ai.ts` | **新檔**：`chooseEnemyAction(enemy, battle, player): EnemyActionIntent` |
| `core/store.ts` | `enemyAct` 改：先呼叫 chooseEnemyAction，依結果分派攻擊/技能/道具邏輯 |
| `systems/battle.ts:enemyChooseAction` | **移除**（已是 stub，不再被引用）|
| `systems/battle.ts:enemyAttackDamage` | 加選填 `power` 參數（以支援火球的 1.8x）|

不動：
- 普通怪 (slime/goblin/skeleton/spider) JSON 不寫 `ai` → 走預設 attack-only
- `playerAct`、`advanceTurn`、UI 不變
- 傷害公式、順序系統不動

## 5. 約束

- **AI 內含的 items 是 boss 私有池**：與玩家 inventory 無關，不影響玩家補品庫存
- **MP 消耗使用 enemy.mp**（過去未實際扣 MP — 因為怪都不施法。新版有 fireball 必須扣 MP）
- **動畫節奏不變**：仍然 600ms enemy phase → enemyAct → animating → 700ms → advanceTurn
- **Log 標示**：
  - 道具：`💚 幽魂龍 使用補血藥水，回復 30 HP`
  - 火球：`🔥 幽魂龍 施放火球術，造成 X 傷害`
  - 普攻：保留現有「反擊」格式
- **時間預算**：1–2 小時實作 + 0.5 小時驗證

## 6. 風險

- **平衡**：boss 加 fireball 後可能變得太強。火球傷害 = atk * 1.8 = 24*1.8 = 43。
  對 Lv.1 玩家 (DEF 4) ≈ 39 點傷害一發秒殺。
  - Lv.1 挑戰 boss 本就不適合 → **可接受**
  - Lv.5+ 配裝備：HP 56、DEF 9 → 火球 24*1.8-9=34，仍有 22 HP → **體驗佳**
  - 機率 30% 避免連連狠多畫面
- **狀態機**：enemyAct 加 item/skill 分支後函式變長，要保持可讀。可考慮抽 helper。
- **資料形狀**：JSON 的 ai 欄位若型別錯誤，TypeScript 編譯時應該抓到。
