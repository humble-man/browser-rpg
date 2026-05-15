# 分析 Analysis — Level-up celebration overlay

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 戰勝怪物，XP 不足升等 | 無 overlay、log 仍顯示「+X XP」 |
| 戰勝怪物，剛好升等 1 級 | Overlay 顯示「Lv 3 → Lv 4」+ stat deltas，~2s 後自動消失 |
| 戰勝強怪一口氣升 2+ 級 | Overlay 顯示「Lv 3 → Lv 5」+ 累計 stat deltas |
| 點擊 overlay | 立即消失 |
| 點「繼續冒險」按鈕 | overlay 必須先消失才能進入 overworld |
| 戰敗 | 無 overlay |
| 戰鬥逃跑 | 無 overlay |

## 2. 既有 leveling 邏輯

`systems/leveling.ts:applyXp` 返回 `{ leveledUp, from, to, hpGained, mpGained }`。
需實作前讀 leveling.ts 確認 ATK/DEF/SPD 是否升等加。
若有但 applyXp 未返回，擴充返回值。若未加，overlay 只顯示 HP/MP。

## 3. 資料模型

```typescript
export interface PendingLevelUp {
  from: number;
  to: number;
  hpGained: number;
  mpGained: number;
  atkGained: number;
  defGained: number;
  spdGained: number;
}
```

Store 加 `pendingLevelUp: PendingLevelUp | null` + `clearLevelUp()` action。

## 4. Victory 邏輯變動

`applyXp` 返回值擴充 ATK/DEF/SPD deltas（若 leveling 有加）。
Victory 內 leveledUp=true 時 set pendingLevelUp（不取代原 log）。

## 5. UI 結構

`<LevelUpOverlay />` 渲染條件：pendingLevelUp 非 null。
- header: ⬆️ LEVEL UP!
- level transition: Lv. X → Lv. Y
- stats grid: HP / MP / ATK / DEF / SPD（只顯示 > 0）
- hint: 點擊或等待自動關閉
- useEffect setTimeout 2000ms call clearLevelUp
- onClick clearLevelUp

## 6. CSS 動畫

`.levelup-backdrop` fixed inset + z=300 + fade-in 0.3s + fade-out at 1.7s。
`.levelup-panel` zoom-in 0.3s。gold gradient 主視覺。

## 7. 邊界案例

- **2+ 級連升**：applyXp 內部處理，overlay 顯示最終 from → to、stat deltas 累加
- **點擊跳過**：clearLevelUp 立即 set null，CSS animation 中斷不問題
- **reload**：pendingLevelUp 不入 save（transient，類 activeDialog）
- **boss 勝利 + 升等**：先顯示 overlay，玩家關掉才看到「繼續」按鈕

## 8. 模組架構

| 檔案 | 變動 |
|---|---|
| types.ts | PendingLevelUp interface |
| leveling.ts | applyXp 返回值加 ATK/DEF/SPD deltas |
| store.ts | pendingLevelUp state + clearLevelUp action + victory set |
| LevelUpOverlay.tsx | **新檔** |
| Battle.tsx | mount `<LevelUpOverlay />` |
| index.css | `.levelup-*` |
| save.ts | **不動** |

## 9. 約束

- transient state 不入 save
- z-index 300 最高層
- ~1 hr 實作 + 30 min 驗證
- 不破壞既有 log

## 10. 風險

- applyXp 返回值 schema 變動 — backward compatible
- CSS animation cleanup 同步必須準確
- z-index 衝突 — lock 200 < levelup 300 ✅
- 多級連升 — applyXp 內部正確處理
