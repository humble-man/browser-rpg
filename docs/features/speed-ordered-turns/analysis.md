# 分析 Analysis — Speed-ordered turns

## 1. 使用情境

| 場景 | SPD 對比 | 預期行為 |
|---|---|---|
| 玩家 Lv.1 (SPD 5) 遇史萊姆 (SPD 3) | 玩家快 | 玩家先攻（與 MVP 同）|
| 玩家 Lv.1 (SPD 5) 遇巨蜘蛛 (SPD 9) | 敵人快 | **敵人先攻**（行為改變）|
| 玩家 Lv.1 (SPD 5) 遇骷髅 (SPD 4) | 玩家快 | 玩家先攻 |
| 玩家裝備武器後 SPD 變化 | 視 bonus | 取最新 effective SPD |
| 玩家 SPD == 敵人 SPD | 並列 | 玩家先（破除）|

## 2. 戰鬥狀態機影響

**現況**：
```
startBattle → phase='player' → 玩家點動作 → 'animating' → 700ms 後 → advanceEnemyTurn → 'player'
```

**目標**：
```
startBattle → computeOrder() → 若敵人快：autoEnemyAct (no player menu) → 'animating' → 玩家可動 → 'animating' → next turn
                                  若玩家快：phase='player'（同 MVP）
```

關鍵變動：
- `startBattle` 需多算一筆「本場首動者」
- 每回合結束時需「下回合首動者」計算
- 新增 phase: `enemy`（尚未實作的「敵方主動回合」，與既有 `animating` 不同）
- 戰鬥 log 需有「敵方先攻」訊息

## 3. 邊界案例

- **敵人先攻 + 一擊必殺**：跳過玩家行動，直接 GameOver。需確保 advanceEnemyTurn 完成判定後不再 schedule player phase。
- **玩家先攻擊敗敵人**：phase='won'，敵人不會行動（與 MVP 同）。
- **玩家逃跑成功**：phase='fled'，battle 結束（與 MVP 同）。
- **逃跑失敗 + 敵人比較快**：邏輯上應該「玩家先嘗試逃跑（消耗回合）→ 失敗 → 敵人攻擊」。MVP 內逃跑就是玩家行動之一，沒有「不頃序跳頻逃」需求。**沿用此語意**。
- **防禦持續性**：
  - 玩家慢：上回合 defend → defending=true → 本回合敵人攻擊（reduced）→ 玩家行動（清除 defending）→ ✅
  - 玩家快：本回合 defend → defending=true → 敵人攻擊（reduced）→ 下回合玩家行動（清除）→ ✅
  - 已驗證兩種情境語意一致。
- **道具 / 治癒消耗回合**：玩家使用道具或治癒術後 phase='animating' → 敵人攻擊。新系統下無變化。

## 4. UX / Log 表現

- 戰鬥開始時若敵人先攻，log 顯示「⚔️ {enemy} 出現了！」+「💨 敵方先攻」
- 每回合（turn++ 之後）log 不需特別標示誰先動，只需動作 log 本身依序出現即可
- 玩家動作前若 phase=enemy_turn，UI 顯示「敵方行動中⋯」（與既有 animating 提示一致）

## 5. 約束

- **不改傷害公式**：computeDamage, playerAttackDamage, enemyAttackDamage 保持不動
- **不改回合計數含義**：仍然「雙方各動一次 = 一回合」
- **不破壞既有 UI**：Battle.tsx 的 useEffect 需小心調整，避免無限 re-render
- **保留 advanceEnemyTurn 命名**：作為「敵人在某 phase 切換時觸發動作」的 wrapper
- **時間預算**：1–2 小時實作 + 0.5 小時驗證
