# 設計 Design — Single quest from the village elder

## 1. Types

```typescript
export interface DialogChoice {
  text: string;
  action: 'close' | 'accept-quest' | 'claim-reward';
}

export interface DialogLine {
  speaker: string;
  text: string;
  choices?: DialogChoice[];
}
```

## 2. `data/maps.ts` 變動

村長「初始狀態」版本，最後一句帶 choices（接受 / 之後再說）。
但狀態變化時由 store 動態換 npc.lines。

## 3. `store.ts` 動態 lines 完整設計

在 store 內定義 4 個 lines const:
- `ELDER_INITIAL` — 同 maps.ts、含 choices
- `ELDER_IN_PROGRESS` — 「辛苦了，幽魂龍解決了嗎？」
- `ELDER_CLAIM` — 2 句 + 「領取獎勵」 choice
- `ELDER_REWARDED` — 「謝謝你⋯」

Helper:
```typescript
function pickElderLines(flags) {
  if (flags['quest-elder-rewarded']) return ELDER_REWARDED;
  if (flags['quest-elder-completed']) return ELDER_CLAIM;
  if (flags['quest-elder-accepted']) return ELDER_IN_PROGRESS;
  return ELDER_INITIAL;
}
```

## 4. `store.ts:movePlayer` npc 分支調整

走到 (2,2) 時用 `pickElderLines(flags)` 換掉 npc.lines。其他 NPC 不動。

## 5. 新 `handleDialogChoice(action)` action

三個 case：close / accept-quest / claim-reward。
accept-quest 設 flag + push message + 關閉 dialog + saveGame。
claim-reward 設 flag + +500G + push message + 關閉 + saveGame。

## 6. boss 勝利時 set quest flag

`playerAct` victory 邏輯加：
```typescript
if (s.battle.isBoss) {
  s.bossDefeated = true;
  s.flags['quest-elder-completed'] = true;
}
```

## 7. `DialogModal.tsx` 支援 choices

若 `line.choices` 存在，render choice buttons 取代「下一句 / 關閉」。
Enter / Space 在 choices 出現時不推進（避免誤觸）。

## 8. CSS

`.dialog-choices` 垂直 stack。

## 9. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `core/save.ts` | flags 已入 save |
| Battle / Shop / Title / GameOver | 不涉及 |
| systems / data 其他 | 不動 |
| 其他 NPC | 靜態保留 |

## 10. 驗證計畫

10 個 case 見 PR 評論：初始、拒絕、接受、中途、完成、領獎、領後、跳接、reload、其他 NPC 不受影響。

## 11. 風險

- multi-action 擴充留 cycle 12+
- DialogLine.choices optional、不破舊
- flag 命名避衝突
