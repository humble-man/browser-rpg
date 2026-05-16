# 設計 Design — Game completion celebration

## 1. Store 變動

- `pendingGameComplete: boolean | null` state + `clearGameComplete()` action
- `claim-reward` 分支 — first-time 領獎時 set pendingGameComplete + completion-shown flag

## 2. 新元件 `GameCompleteOverlay.tsx`

- 讀 pendingGameComplete、非 null 才渲染
- mount 時即時讀 player.level / gold / flags / bossDefeated
- 4 列統計 + 2 個按鈕（繼續探索 / 回標題）

## 3. Overworld.tsx mount

與 EquipModal / ItemsModal / DialogModal 並列 render。

## 4. CSS

- `.game-complete-backdrop` z=350
- `.game-complete-panel` 金邊 + glow + zoom-in 0.4s
- `.gc-banner` 金色大字
- `.gc-stats` grid space-between
- `.gc-stat-row strong` 金色值

## 5. 不動的部分

| 模組 | 為何不動 |
|---|---|
| types.ts | 不需新型別 |
| save.ts | pendingGameComplete transient |
| Battle / Title / GameOver / Shop | 不涉及 |
| systems / data | 不涉及 |

## 6. 驗證計畫

7 case 見 PR 評論。

## 7. 風險

- z-index 350 安全
- transient state 不漏
- flag 避衝突 ✅
- new game+ 未來需 reset
