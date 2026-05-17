# 分析 Analysis — Battle hit animations

## 1. 使用情境

| 情境 | Attacker | Defender 視覺 |
|---|---|---|
| 玩家普攻命中 | player portrait lunge-up | enemy portrait 紅閃 + 既有 shake |
| 玩家爆擊命中 | player portrait lunge-up | enemy 紅閃(亮) + shake + portrait scale |
| 玩家治癒 / 補品 | — | player portrait 綠閃 |
| 敵人普攻命中 | enemy portrait lunge-down | player portrait 紅閃 + 既有 shake |
| 敵人爆擊命中 | enemy portrait lunge-down | player 紅閃(亮) + shake + portrait scale |
| Boss heal | — | enemy portrait 綠閃 |
| 玩家 defend / flee | 無 anim | 無 anim |
| Enemy 死亡 (phase=won) | — | enemy portrait fade + 下沉 |
| Player 死亡 (phase=lost) | — | player portrait fade + 下沉 |

## 2. 觸發機制（沿用 cycle 16 lastDamage useEffect）

phase='animating' useEffect：
- attacker = lastDamage.target === 'enemy' ? 'player' : 'enemy'
- heal / undefined target → attacker = null（跳過 lunge）
- crit=true → defender 加 .crit-impact

phase='won' → enemy portrait .defeated
phase='lost' → player portrait .defeated

## 3. 不改 store / battle / lastDamage

所有資料 derive 自既有 phase + lastDamage（cycle 16 已加 kind）。

## 4. Battle.tsx 變動

```typescript
// 新增 transient state
const [lungeAttacker, setLungeAttacker] = useState<'player'|'enemy'|null>(null);
const [hitFlash, setHitFlash] = useState<{
  target: 'player'|'enemy'; kind: 'damage'|'heal'; crit: boolean; key: number
} | null>(null);
```

useEffect on lastDamage：推 lunge (250ms timer) + flash (200ms timer) + 若 crit 則 crit-impact (300ms)。
defeated class 直接從 phase 推（無需 state）。

## 5. CSS（疊加，不改既有）

新 keyframes：
- `lunge-up` — translateY -24px ↔ 0（250ms）
- `lunge-down` — translateY +24px ↔ 0（250ms）
- `hit-flash` — opacity 0→1→0（200ms）
- `crit-impact` — scale 1→1.25→1（300ms）
- `defeated-fade` — opacity 1→0、translateY +30px、800ms forwards

新 class（全綁 `.combatant-portrait`）：
- `.lunge-up` / `.lunge-down`
- `.hit-flash`（::after overlay 紅色）
- `.hit-flash.heal`（綠色覆蓋）
- `.crit-impact`（scale）
- `.defeated`（fade + sink）

`.combatant-portrait` 加 `position: relative` 容納 `::after` overlay。

## 6. 邊界案例

- 連續攻擊 → key-bumped state，portrait class 重新觸發
- 動畫期間離開 battle scene → React cleanup timers
- 同時觸發 defeat fade + floating damage → 數字仍 render（z-index 高，且 number 在 `.combatant` 而非 portrait）
- player defending 標籤是 `.combatant::after` — 不與 portrait::after 衝突
- crit + lunge 同元素 transform 衝突 → crit-impact 用 scale，lunge 用 translateY，**疊用兩個 keyframe 會互覆蓋**（同一 element 的 transform 多 animation 後者勝）

## 7. 模組架構

| 檔案 | 變動 |
|---|---|
| `Battle.tsx` | +2 state、+1 useEffect、portrait className 拼接狀態 class |
| `index.css` | +5 keyframes、+5 class、+1 ::after overlay |

不動：types.ts、store.ts、audio.ts、save.ts、systems/*、ui/*

## 8. 約束

- 既有 `.combatant.shake` 不改、不取代
- 動畫長度 ≤ phase='animating' 700ms 窗口（既有 timer）
- defeat fade 800ms 跨入 won/lost，不阻下回合
- 純 CSS、零依賴
- 時間預算：~45 min + 15 min 驗證

## 9. 風險

- **lunge + crit-impact transform 衝突**：兩者都改 transform，同元素同時套用後者勝
  - **緩解**：合併為單一 keyframe（crit 時用 `crit-lunge-up` 含 scale + translateY）；或讓 lunge attacker 與 crit-impact defender 永不同個元素（事實如此，因 attacker ≠ defender），可避開
- **portrait::after 排版**：需 `position: relative` + `inset: 0`
  - **緩解**：CSS 加上即可
- **未來 sprite 替換 (#7)**：portrait 從 emoji 變 `<img>` 時 ::after overlay 機制仍適用
- **性能**：最多 5 個並行 animation × 2 elements，DOM 開銷可忽略
