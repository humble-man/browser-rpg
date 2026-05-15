# 設計 Design — Reactive NPC dialog

## 1. Store 變動

### 1.1 新 lines 常數

5 個常數：ADVENTURER_DEFAULT / ADVENTURER_MINIBOSS_BEATEN / ADVENTURER_BOSS_BEATEN /
INNKEEPER_DEFAULT / INNKEEPER_POST_REWARD。

### 1.2 新 helper 函式

```typescript
function pickAdventurerLines(flags, bossDefeated): DialogLine[] {
  if (bossDefeated) return ADVENTURER_BOSS_BEATEN;
  if (flags['mini-boss-defeated']) return ADVENTURER_MINIBOSS_BEATEN;
  return ADVENTURER_DEFAULT;
}

function pickInnkeeperLines(flags): DialogLine[] {
  if (flags[QUEST_REWARD]) return INNKEEPER_POST_REWARD;
  return INNKEEPER_DEFAULT;
}
```

### 1.3 movePlayer 包含 3 NPC if-chain

```typescript
if (mapId === 'village') {
  if (nx === 2 && ny === 2) lines = pickElderLines(get().flags);
  else if (nx === 8 && ny === 4) lines = pickAdventurerLines(get().flags, get().bossDefeated);
  else if (nx === 3 && ny === 6) lines = pickInnkeeperLines(get().flags);
}
```

## 2. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `data/maps.ts` | NPC base lines 保留作 fallback / 文件記錄 |
| `types.ts` | 無新型別 |
| `DialogModal` | 邏輯不變 |
| 其他 | 不涉及 |

## 3. 驗證計畫

見 PR 評論。7 個 case + 回歸測試。

## 4. 風險

- flag 順序仔細（bossDefeated 先於 miniBoss）
- 修改範圍小，零破壞性
