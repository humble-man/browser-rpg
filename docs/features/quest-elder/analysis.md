# 分析 Analysis — Single quest from the village elder

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 新玩家首次見村長 | 顯示 3 句 lore + 第 3 句結尾出現「接受任務 / 之後再說」二選一 |
| 點「之後再說」 | dialog 關閉、無 flag 改變、下次見村長重來 |
| 點「接受任務」 | flag `quest-elder-accepted=true`、訊息「📜 接受任務」、dialog 關閉 |
| 接任務後再見村長 | 「辛苦了，幽魂龍解決了嗎？」單句、無分支 |
| 不接任務也打 boss | 仍可打、boss 戰鬥流程不變、completed flag 也 set |
| 打敗 boss 後 | flag `quest-elder-completed=true` set 在 store 的 victory 處理裡 |
| 完成後見村長 | 「你做到了！」+ 「領取獎勵」按鈕 → +500G + rewarded=true |
| 領完獎後見村長 | 「謝謝你，碧楓村得救了。」單句 |
| 反覆存讀檔 | flags 持久化、不丟狀態 |

## 2. 狀態機

```
[no flags] → accept → [accepted] → boss defeat → [accepted, completed] → claim → [all]
```

completed 在 accepted=false 也可 set（先打 boss 再接）。領獎條件：`completed && !rewarded`。

## 3. NPC 對話動態 lines

選方案 A：在 store 端判斷狀態、動態換裝 npc.lines。

```typescript
function getElderLines(flags): DialogLine[] {
  if (flags['quest-elder-rewarded']) return REWARDED_LINES;
  if (flags['quest-elder-completed']) return CLAIM_LINES;
  if (flags['quest-elder-accepted']) return IN_PROGRESS_LINES;
  return INITIAL_LINES;
}
```

在 movePlayer npc 分支設 activeDialog 時決定。types 不變。

## 4. 對話分支「按鈕選擇」

`DialogLine` 加 optional `choices?: DialogChoice[]`。

```typescript
export interface DialogChoice {
  text: string;
  action: 'close' | 'accept-quest' | 'claim-reward';
}
```

當 line 有 `choices` 時，DialogModal 顯示按鈕陣列、點擊執行 action。關閉 action set，無任意 callback。

## 5. 對話內容草稿

### 5.1 初始 (no flags)

1.「歡迎來到碧楓村，年輕的冒險者。」
2.「最近村南的幽影迷宮鬧出怪事⋯野獸增加、夜裡有奇怪聲響。」
3.「若你願意幫忙調查，全村都會感謝你。」
   choices: [接受任務 / 之後再說]

### 5.2 已接受、未完成

1.「辛苦了，幽魂龍解決了嗎？」

### 5.3 已完成、未領獎

1.「你做到了！全村得救了！」
2.「這是村人湊出的謝禮，請收下。」
   choices: [領取獎勵 (+500G)]

### 5.4 已領獎

1.「謝謝你，碧楓村得救了。」

### 5.5 邊角—未接但已打 boss

(accepted=false, completed=true) → 顯示§5.3 領獎流程。
評判條件為 `completed && !rewarded`，不需要 accepted。

## 6. boss 戰勝利時 set flag

`store.ts:playerAct` victory 邏輯加：

```typescript
if (s.battle.isBoss) {
  s.bossDefeated = true;
  s.flags['quest-elder-completed'] = true;
}
```

## 7. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/core/types.ts` | `DialogLine.choices?`、`DialogChoice` type |
| `src/data/maps.ts` | 村長 lines 改為「初始版」+ choices；其他 NPC 不動 |
| `src/core/store.ts` | `movePlayer` npc 分支加 `getElderLines(flags)`；新 `handleDialogChoice(action)` action；boss victory set quest flag |
| `src/ui/DialogModal.tsx` | 若 line 有 choices，render choice buttons；無則「下一句」 |
| `src/index.css` | `.dialog-choices` 樣式 |

## 8. 邊界案例

- **接任務後存檔再讀**：flags 已存 save，accepted 仍 true ✅
- **未接 boss 仍可打**：boss 戰邏輯不受 flag 影響 ✅
- **領獎後再見村長**：rewarded=true → §5.4 對話、無按鈕 ✅
- **連點領獎**：handleDialogChoice 內檢查 `if (rewarded) return;` 防重複領
- **戰鬥中 NPC**：戰鬥中走不動，不會觸發

## 9. 約束

- 不引入 quest log UI
- 不改 NPC 之外的場景
- 不破壞 cycle 10 對話流程
- 時間預算：~1 hr 實作 + 30 min 驗證

## 10. 風險

- **flag 命名**：`quest-elder-*` 避免與既有 `treasure-*` 衝突
- **DialogLine.choices 型別變動**：optional，不破壞既有 NPC
- **狀態錯亂**：flags={} → 初始路徑 ✅
- **保留 cycle 12+**：multi-quest、quest log、quest item、quest expire
