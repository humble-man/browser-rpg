# 設計 Design — Battle hit animations

## 1. 範圍

- **動**：`src/scenes/Battle.tsx`（state + render）、`src/index.css`（keyframes + class）
- **不動**：types / store / save / audio / systems / data / 既有 shake

## 2. Battle.tsx 狀態擴充

```typescript
const [lungeAttacker, setLungeAttacker] = useState<'player' | 'enemy' | null>(null);
const [hitFlash, setHitFlash] = useState<{
  target: 'player' | 'enemy';
  kind: 'damage' | 'heal';
  crit: boolean;
  key: number;
} | null>(null);
```

## 3. useEffect on lastDamage（擴充既有 floatingDmg effect）

```typescript
useEffect(() => {
  if (!battle?.lastDamage) return;
  const { target, amount, crit, kind } = battle.lastDamage;
  dmgKeyRef.current += 1;
  const key = dmgKeyRef.current;
  const dmgKind = kind ?? 'damage';

  // 既有 floating number
  setFloatingDmg({ key, target, amount, crit, kind: dmgKind });

  // 新增 hit-flash + lunge
  setHitFlash({ key, target, kind: dmgKind, crit: crit ?? false });
  setLungeAttacker(
    dmgKind === 'damage' ? (target === 'enemy' ? 'player' : 'enemy') : null
  );

  const tFloat = setTimeout(() => setFloatingDmg(null), 1000);
  const tFlash = setTimeout(() => setHitFlash(null), 350);
  const tLunge = setTimeout(() => setLungeAttacker(null), 280);
  return () => { clearTimeout(tFloat); clearTimeout(tFlash); clearTimeout(tLunge); };
}, [battle?.lastDamage]);
```

## 4. JSX 變動（兩 portrait 對稱）

```jsx
// Enemy portrait
<div
  className={`combatant-portrait${
    lungeAttacker === 'enemy' ? ' lunge-down' : ''
  }${
    hitFlash?.target === 'enemy' && hitFlash.crit ? ' crit-impact' : ''
  }${
    phase === 'won' ? ' defeated' : ''
  }`}
>
  {enemy.emoji}
  {hitFlash?.target === 'enemy' && (
    <span
      key={hitFlash.key}
      className={`hit-flash${hitFlash.kind === 'heal' ? ' heal' : ''}`}
    />
  )}
</div>

// Player portrait 對稱：lunge-up + phase === 'lost' defeated + target === 'player'
```

## 5. CSS keyframes（疊加在 index.css）

```css
@keyframes lunge-up {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-24px); }
}
@keyframes lunge-down {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(24px); }
}
@keyframes hit-flash-anim {
  0%   { opacity: 0; }
  30%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes crit-impact {
  0%, 100% { transform: scale(1); }
  40%      { transform: scale(1.25); }
}
@keyframes defeated-fade {
  to { opacity: 0; transform: translateY(30px); }
}
```

## 6. CSS classes

```css
.combatant-portrait {
  /* 既有屬性 + */
  position: relative;
}
.combatant-portrait.lunge-up    { animation: lunge-up    250ms ease-out; }
.combatant-portrait.lunge-down  { animation: lunge-down  250ms ease-out; }
.combatant-portrait.crit-impact { animation: crit-impact 300ms ease-out; }
.combatant-portrait.defeated    { animation: defeated-fade 800ms ease-in forwards; }

.hit-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 64, 64, 0.7), transparent 70%);
  pointer-events: none;
  animation: hit-flash-anim 200ms ease-out;
  z-index: 1;
}
.hit-flash.heal {
  background: radial-gradient(circle, rgba(64, 240, 128, 0.7), transparent 70%);
}
```

## 7. 時序（單一回合，700ms animating window）

```
t=0     phase=animating、lastDamage set
        ├─ floating number 出現（既有，1000ms）
        ├─ hit-flash span re-mount（200ms anim）
        ├─ defender .crit-impact class（若爆擊，300ms scale）
        ├─ defender .combatant.shake（既有，400ms）
        └─ attacker .lunge-up/down class（250ms）
t=280   lunge class 清除
t=350   hit-flash 清除（含 crit-impact）
t=400   shake 結束（既有）
t=700   advanceTurn()，phase 轉 enemy/player/won/lost
t=700+  若 phase=won/lost → 對應 portrait .defeated 開始 fade（800ms forwards）
```

連續 hit 時 hitFlash.key 遞增 → `<span>` re-mount → 動畫重啟。
turn 間隔 ≥700ms > 350ms timer，class 都已清除，下回合動畫可正常重播。

## 8. 不動的部分

| 模組 | 為何不動 |
|---|---|
| types.ts | 不改 BattleState |
| store.ts | 不改 playerAct / enemyAct / lastDamage 結構 |
| save.ts | hit anim 不入 save |
| audio.ts | SE 不變 |
| systems/* | 不涉及 |
| `.combatant.shake` keyframes | 沿用、不取代 |
| `.damage-number` 規則 | 不變 |
| 其他 scenes / data | 不涉及 |

## 9. 驗證計畫（stage 4 詳列）

- 玩家普攻命中 → enemy portrait 紅閃 + shake + lunge-up
- 玩家爆擊 → 加 crit-impact (enemy scale)
- 玩家自治（heal skill / heal potion）→ player portrait 綠閃、無 lunge
- 敵普攻命中 → player portrait 紅閃 + shake + lunge-down
- 敵爆擊 → 加 crit-impact (player scale)
- Boss heal（mini-boss 有 heal）→ enemy portrait 綠閃、無 lunge
- Enemy HP=0 → enemy portrait fade + sink
- Player HP=0 → player portrait fade + sink
- TypeScript strict build 通過
- 0 console errors / warnings

## 10. 風險再評估

| 風險 | 緩解 | 結果 |
|---|---|---|
| transform 多 animation 衝突 | attacker ≠ defender；lunge 與 crit-impact 永遠不同 element | ✅ |
| portrait::after 與 damage-number 衝突 | damage-number 是 `.combatant` 子元素、hit-flash 是 portrait 子元素 | ✅ |
| 連 hit CSS animation 不重播 | hit-flash span 用 key bump 重新 mount | ✅ |
| crit-impact 連續觸發不重播 | 350ms timer 清 class、turn 間隔 ≥700ms 確保 class 已清 | ✅ |
| defeated fade 與 floating number 並存 | 不同 z-index 層 | ✅ |
| phase=fled 不觸發 fade | defeated class 只看 won/lost | ✅ |
