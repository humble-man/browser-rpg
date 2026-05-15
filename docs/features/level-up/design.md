# 設計 Design — Level-up celebration overlay

## 1. Types

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

## 2. `systems/leveling.ts` 擴充

`applyXp` 返回值加 atkGained/defGained/spdGained，並在 while loop 累加。
Backward compatible — 既有 caller 只讀 hp/mp。

## 3. Store 變動

- `pendingLevelUp: PendingLevelUp | null` state
- `clearLevelUp()` action set 為 null
- Victory 邏輯加 set pendingLevelUp（與原 log 並存）

## 4. 新元件 `src/ui/LevelUpOverlay.tsx`

- 讀 pendingLevelUp
- useEffect setTimeout 2000ms 自動 clear
- onClick backdrop clear
- Panel stopPropagation 避免內層誤觸
- 顯示 stat deltas（只顯示 > 0）

## 5. `Battle.tsx` mount `<LevelUpOverlay />`

不需 conditional — 元件自判 null。

## 6. CSS

`.levelup-backdrop` z=300 + fade in/out
`.levelup-panel` 金邊、暗紫內、zoom-in
`.levelup-banner` 金色大字 + text-shadow
`.levelup-stats` 黑色 monospace +X HP 等

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| save.ts | pendingLevelUp transient |
| Shop / Title / GameOver / Overworld | 不涉及 |
| 其他 systems | 不涉及 |
| data JSON | 不影響 |

## 8. 驗證計畫

8 個 case：未升、升 1 級、升多級、點擊、自動、boss 勝、失敗、reload。

### 回歸測試

Cycle 1-12 全功能保留。

## 9. 風險

- applyXp 返回值 backward compat ✅
- useEffect cleanup 處理 unmount ✅
- z-index 300 > lock 200 ✅
- panel stopPropagation 防穿透 ✅
