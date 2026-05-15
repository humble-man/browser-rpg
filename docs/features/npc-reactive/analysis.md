# 分析 Analysis — Reactive NPC dialog

## 1. 使用情境

| 場景 | 神秘冒險者 | 旅店老闆娘 |
|---|---|---|
| 新遊戲 | 預設 4 句 | 預設 2 句 |
| 接受元老 quest | 預設不變 | 預設不變 |
| 擊敗 mini-boss | 切換為「你做到了」 | 預設不變 |
| 擊敗 boss | 切換為「你連龍都打倒了」 | 預設不變 |
| 領完村長獎 | 同 boss 擊敗對話 | 切換為「村長今天可開心了」 |

## 2. 狀態決定樹

**神秘冒險者**：
```
if bossDefeated → BOSS_BEATEN_LINES
elif flags['mini-boss-defeated'] → MINI_BOSS_BEATEN_LINES
else → DEFAULT_LINES
```

**旅店老闆娘**：
```
if flags['quest-elder-rewarded'] → POST_REWARD_LINES
else → DEFAULT_LINES
```

旅店看 `quest-elder-rewarded`（領獎）而非 `quest-elder-completed`（boss 擊敗）。
這樣旅店反應「村長已經拿到報告」而非「玩家剛打贏」。

## 3. 對話內容草稿

見 PR diff。神秘冒險者 mini-boss 變體 2 句、boss 變體 2 句；
旅店老闆娘 post-reward 變體 2 句。

## 4. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/core/store.ts` | 加 `pickAdventurerLines(flags, bossDefeated)` + `pickInnkeeperLines(flags)`；`movePlayer` npc 分支 switch 3 個位置 |
| 其他 | 不動 |

神秘冒險者 helper 需 `bossDefeated`（state.bossDefeated）+ flags。

## 5. movePlayer 變動

```typescript
if (mapId === 'village') {
  if (nx === 2 && ny === 2) lines = pickElderLines(get().flags);
  else if (nx === 8 && ny === 4) lines = pickAdventurerLines(get().flags, get().bossDefeated);
  else if (nx === 3 && ny === 6) lines = pickInnkeeperLines(get().flags);
}
```

## 6. 邊界案例

- mini-boss 擊敗 + boss 未擊敗 → 冒險者 mini-boss 變體
- boss 擊敗 + 未領獎 → 冒險者 boss 變體、旅店預設
- 領獎後 → 旅店切換；冒險者 boss 變體
- flag reset → 所有變體回預設
- 舊 save migration → 預設路徑 ✅

## 7. 約束

- 不加 quest action
- 不加獎勵
- 純 dialog lines override
- ~30 min + 15 min 驗證

## 8. 風險

- flag 對應錯誤 — 順序 if/elif 仔細檢
- dialogue 長度 — 保持每句 < 40 字
- 未來 multi-NPC quest — 下 cycle refactor
