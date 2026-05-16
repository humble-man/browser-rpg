# 分析 Analysis — Floating damage numbers

## 1. 使用情境

| 動作 | 位置 | 顏色 | 內容 |
|---|---|---|---|
| 玩家普攻 | 敵人上方 | 白 | `24` |
| 玩家爆擊 | 敵人上方 | 金黃 + 大 | `24!` |
| 玩家治癒 | 玩家上方 | 綠 | `+30` |
| 玩家補品（戰鬥內）| 玩家上方 | 綠 | `+30` |
| 敵人攻擊 | 玩家上方 | 白 | `8` |
| 敵人爆擊 | 玩家上方 | 金黃 + 大 | `8!` |
| 敵人補品（boss heal）| 敵人上方 | 綠 | `+30` |
| 連續攻擊 | 每次重新觸發動畫 |

## 2. lastDamage 資料結構擴充

加 optional `kind`：

```typescript
lastDamage?: {
  target: 'player' | 'enemy';
  amount: number;
  crit?: boolean;
  kind?: 'damage' | 'heal';
};
```

undefined kind = damage（backward compat）。

## 3. UI 觸發機制

選**方案 B**：Battle.tsx 用 useState + useRef counter 從 lastDamage 拷貝出 local floatingDmg。
每次 lastDamage 變動觸發 useEffect → keyRef++ → setFloatingDmg。1s setTimeout cleanup。

## 4. UI 結構

根據 target 渲染在 .combatant-enemy / .combatant-player 內部，絕對定位。

## 5. CSS animation

上升 40px + opacity 1 → 0，1s ease-out。
爆擊加 .crit class 變大變黃；治癒加 .heal class 變綠。

## 6. Store 變動

- playerAct heal skill case 加 `lastDamage = { target, amount, kind: 'heal' }`
- playerAct item case (補品) 同上
- enemyAct heal case 同上 (target='enemy')

## 7. 模組架構

| 檔案 | 變動 |
|---|---|
| `types.ts` | `lastDamage.kind?: 'damage' \| 'heal'` |
| `store.ts` | playerAct/enemyAct heal 邏輯 set lastDamage with kind |
| `Battle.tsx` | floatingDmg state + useEffect + render |
| `index.css` | `.damage-number` + .crit / .heal variants + keyframes |

## 8. 邊界案例

- 連續攻擊 → keyRef++ → re-mount
- 動畫中切場景 → Battle 卸載 → cleanup
- lastDamage=undefined → 條件 render 跳過
- HP 滿時治癒 → amount=0 → 顯「+0」

## 9. 約束

- 不改 phase machine
- 不改傷害公式
- 1s 動畫不阻擋下一動作
- ~30 min + 15 min 驗證

## 10. 風險

- CSS 定位 — .combatant-* 需 position: relative、需確認
- key 重新觸發動畫 — useState + useRef 可靠
- kind backward compat — optional 欄位 ✅
