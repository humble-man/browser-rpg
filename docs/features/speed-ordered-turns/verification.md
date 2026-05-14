# 驗證 Verification — Speed-ordered turns

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#10 — verifier comment](https://github.com/humble-man/browser-rpg/pull/10#issuecomment-4449706218)**

## 實測結果

| Case | 結果 |
|---|---|
| Skeleton (SPD 4) vs 玩家 (SPD 5) | ✅ 玩家先攻，log 無「敵方先攻」 |
| Spider (SPD 9) vs 玩家 (SPD 5) | ✅ 敵人先攻，log 含「💨 敵方先攻」 |
| Defend → 敵人攻擊 | ✅ 傷害 11 → 6（減半）|
| 下回合無 defend | ✅ 傷害 12（正常，defending 已消耗）|
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：4 個（types.ts / battle.ts / store.ts / Battle.tsx）
- **未動檔案**：encounter / inventory / leveling / data/*.json / 其他 scenes
- **Diff**：+57 − 28 行

## 順帶修正

MVP 隱性 bug：`defending` 讀取後未消耗。新版 `enemyAct` 以 `wasDefending` 讀後即消語意修正。
