# 設計 Design — Speed-ordered turns

## 1. 狀態機重設計

新增 `enemy` phase（敵方主動回合），與既有 `animating` 區分：

| Phase | 含義 | 退出條件 |
|---|---|---|
| `player` | 等待玩家輸入 | 玩家點按行動按鈕 |
| `animating` | 顯示上一個動作結果 | 700ms timeout → `advanceTurn` |
| `enemy` | 敵方準備行動 | 600ms timeout → `enemyAct` |
| `won` / `lost` / `fled` | 終止 | 玩家點「繼續」 → `closeBattle` |

## 2. 新型別

```typescript
// types.ts
export type Actor = 'player' | 'enemy';
export type BattlePhase = 'player' | 'enemy' | 'animating' | 'won' | 'lost' | 'fled';

export interface BattleState {
  // existing...
  actionQueue: Actor[];   // 本回合行動順序
  queueIndex: number;     // 0 = 首動者, 1 = 次動者
}
```

## 3. 新函式

```typescript
// systems/battle.ts
export function computeOrder(playerSpd: number, enemySpd: number): Actor[] {
  return playerSpd >= enemySpd ? ['player', 'enemy'] : ['enemy', 'player'];
}
```

`>=` 而非 `>`：實現「同 SPD 玩家先」規則。

## 4. Store 變動

### 4.1 `startBattle`

加上 `actionQueue` / `queueIndex` 初始化。若敵人先動打入 log 一行「敵方先攻」。

### 4.2 `advanceTurn`（rename from `advanceEnemyTurn`）

純 phase 切換邏輯，**不再內含敵人攻擊**：
- queueIndex++
- 若超出陣列長度：turn++，重算 actionQueue，queueIndex 歸零
- 依下一個 actor 設 phase

### 4.3 新 `enemyAct`（敵人攻擊抽出）

- 讀取 `wasDefending = state.player.defending`
- 計算傷害、扣血
- **消耗** defending（修 MVP 隱性 bug）
- 推記戰鬥動作 → phase='animating'
- 若玩家 HP 歸零 → phase='lost'

### 4.4 `playerAct` 微調

動作結束後仍 set phase='animating'（不變），不再直接判斷敵人輪到，由 `advanceTurn` 統一處理。

## 5. Battle.tsx 變動

```typescript
useEffect(() => {
  if (!battle) return;

  if (battle.phase === 'animating') {
    // 動畫 + 過 700ms 推進到下一個 actor
    ...
    const t = setTimeout(() => advanceTurn(), 700);
    return () => clearTimeout(t);
  }

  if (battle.phase === 'enemy') {
    // 給玩家 600ms 讀「敵方行動中」訊息再執行
    const t = setTimeout(() => enemyAct(), 600);
    return () => clearTimeout(t);
  }

  if (battle.phase === 'player') setMenu('main');
}, [battle?.phase, advanceTurn, enemyAct, battle]);
```

UI 變動：
- 戰鬥等待文字統一為「敵方行動中⋯」覆蓋 `phase === 'enemy'` 與 `phase === 'animating'`

## 6. 防禦語意修正（順帶 fix 隱性 bug）

MVP 在 `advanceEnemyTurn` 讀取 `defending` 但**沒消耗**。
新版在 `enemyAct` 內**讀後即消**，避免「玩家慢 → defend → 兩回合都受益」的潛在錯誤。

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `systems/battle.ts:computeDamage` | 傷害公式不變 |
| `systems/encounter.ts` | 與順序無關 |
| `systems/inventory.ts` | 與順序無關 |
| `systems/leveling.ts` | 與順序無關 |
| `Title.tsx` / `Overworld.tsx` / `Shop.tsx` / `GameOver.tsx` | 不涉及戰鬥順序 |
| 全部 `data/*.json` | 怪 / 道具 / 技能無新增 |

## 8. 驗證計畫

實作完成後，以 Claude Preview 在瀏覽器：

| Case | 怪 | 預期 |
|---|---|---|
| 玩家快 | 史萊姆 (SPD 3) | 玩家先攻，log 不含「敵方先攻」 |
| 玩家慢 | 巨蜘蛛 (SPD 9) | 敵人先攻，log 第二行為「💨 敵方先攻」 |
| 龍 (SPD 8) | 龍 | 敵人先攻 |
| 防禦消耗 | 任一 | defend 後下個敵人攻擊減半，再一次為正常 |
| 1v1 玩家擊倒 | 史萊姆 | 攻擊一次擊殺，phase='won'，敵方無行動 |
| 1v1 被打倒 | 龍（大幅讓玩家）| phase='lost' → GameOver |
| 逃跑失敗 + 敵快 | 蜘蛛 | 玩家逃跑 phase=animating → advanceTurn → enemy → enemyAct |

## 9. 風險

- `useEffect` 依賴陣列含 `battle?.phase` 即可，加入 `battle` 本身會無謂 re-render — **保留 phase only 比對**
- StrictMode 雙重執行 useEffect 在 dev 模式可能讓 timer 重複設置 → 用 cleanup 函式取消
- `enemyAct` 內 `get().player.hp <= 0` 檢查必須在 set 完成後讀取新 state
