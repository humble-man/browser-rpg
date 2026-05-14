# 設計 Design — Enemy AI tactics

## 1. 新型別 (`types.ts`)

```typescript
export type EnemyActionIntent =
  | { type: 'attack' }
  | { type: 'skill'; skillId: string }
  | { type: 'item'; itemId: string };

export interface EnemyAI {
  items: { itemId: string; count: number }[];
  skills: string[];
}

export interface Monster {
  // ...existing...
  ai?: EnemyAI;
}
```

## 2. 新模組 `systems/enemy-ai.ts`

規則式決策：
- HP < 30% → 取 ai.items 第一個可用 consumable
- 否則枚舉 ai.skills，若為攻擊型 + MP 足夠 + chance(0.3) → 施放
- 其餘→ attack

代碼見 PR diff。

## 3. `systems/battle.ts` 變動

- `enemyAttackDamage` 加 optional `power` 參數（預設 1.0，backward-compatible），以支援 fireball 1.8x
- 刪除 stub `enemyChooseAction`（不再被引用）

## 4. `data/monsters.json` 變動

只給 dragon 加 `ai`：

```json
{
  "dragon": {
    ...,
    "ai": {
      "items": [{ "itemId": "potion", "count": 2 }],
      "skills": ["fireball"]
    }
  }
}
```

普通怪不寫 `ai` → 沿用 attack-only。

## 5. `store.ts:enemyAct` 重構

趣從 `chooseEnemyAction` 的 intent 分三路徑：
- **item (heal)**：給敵人補 HP、消耗 AI 道具池、log `💚`
- **skill (attack 型)**：扣 enemyCurrentMp、以 skill.power 乘以傷害、log `🔥`
- **attack**：同 MVP / cycle 2 行為，log `💢`

在任一路徑完成後檢查玩家是否超過→phase='lost'。

## 6. UI 影響

- `Battle.tsx` **完全不動**
- log 自動顯示新訊息
- HP/MP 條在敵方補血 / 消 MP 時即時更新

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `systems/leveling.ts` | 與 AI 無關 |
| `systems/encounter.ts` | 與 AI 無關 |
| `systems/inventory.ts` | 玩家庫存與 AI 私有池分開 |
| Scenes | UI 層不需改 |
| 其他 `data/*.json` | 不增加新 item/skill |
| `playerAct` | 完全不變 |

## 8. 驗證計畫

啟 dev server，從 title 開始 → 直接 force-spawn dragon battle（透過 `await import('/src/core/store.ts')` 呼叫 startBattle）：

| Case | 預期 |
|---|---|
| Dragon 滿血開戰 | 多回合觀察：偶爾「🔥 火球術」出現 |
| Dragon 削到 < 30% | log 「💚 幽魂龍 使用補血藥水」 + HP 上升 |
| Dragon 補品用完後再低血 | fallback 到 attack/fireball |
| 普通怪（蜘蛛） | log **不**出現補血/火球，只攻擊 |
| Dragon MP 耗盡 | 之後只能普攻 |
| Console error/warning | 0 |

### 回歸測試 (不能破舊功能)

- Cycle 1：買補品 / 升等 / 逃跑仍正常
- Cycle 2：蜘蛛 SPD 9 仍「敵方先攻」、防禦仍減害 + 消耗

## 9. 風險

- **平衡**：fireball 對 Lv.1 可能秒殺，但 Lv.1 本不該挑 boss。保留預設數值。
- **狀態同步**：AI items 是 Monster 子物件，startBattle 的 deep copy 可安全 mutate。
- **TS 嚴格**：`enemy.ai?.items.find(...)` 需处理 undefined，已在設計考慮。
- **回歸風險**：驗證階段重跑 cycle 1/2 case。
