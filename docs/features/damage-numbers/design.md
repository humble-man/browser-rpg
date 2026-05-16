# 設計 Design — Floating damage numbers

## 1. Types

`BattleState.lastDamage` 加 optional `kind?: 'damage' | 'heal'`。

## 2. Store 變動

- playerAct heal skill: set lastDamage with kind='heal' target='player'
- playerAct item case: 計算 hpGain、if > 0 set lastDamage heal
- enemyAct item heal: set lastDamage heal target='enemy'

## 3. Battle.tsx 變動

- floatingDmg state + keyRef counter
- useEffect on `battle?.lastDamage` → keyRef++ + setState + 1s setTimeout cleanup
- Render 在 .combatant-enemy / .combatant-player 內部條件輸出

## 4. CSS

- `.combatant-enemy/.combatant-player` 確保 position: relative
- `.damage-number` absolute top: -10px、白色、font-size 28px、monospace、z=50
- `.damage-number.crit` 38px 金黃 + glow
- `.damage-number.heal` 綠色 + glow
- `@keyframes dmg-float` translateY 0→-50px、opacity 1→0、1s ease-out

## 5. 不動的部分

| 模組 | 為何不動 |
|---|---|
| save.ts | lastDamage 不入 save |
| systems | 不涉及 |
| 其他 scenes | 不涉及 |
| data | 不影響 |
| 戰鬥 phase 邏輯 | 不變 |

## 6. 驗證計畫

8 case 見 PR 評論。

## 7. 風險

- z-index 衝突 — 50 高於 HP bar / 立繪 / log
- useEffect cleanup 處理 unmount
- keyRef 避免 connection race
- position: relative 確認已設
