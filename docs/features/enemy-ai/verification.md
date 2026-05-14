# 驗證 Verification — Enemy AI tactics

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#11 — verifier comment](https://github.com/humble-man/browser-rpg/pull/11#issuecomment-4449857950)**

## 實測結果

| Case | 結果 |
|---|---|
| Lv.1 vs Dragon → 火球 crit 61 dmg K.O. | ✅ |
| Dragon HP=30 → 補血 30 HP，pool 2→1 | ✅ |
| Dragon HP=20 → 補血 30 HP，pool 1→0 | ✅ |
| Dragon HP=15 + pool=[] | ✅ fallback 到 attack |
| 蜘蛛 HP=5（無 AI）| ✅ 只攻擊（regression） |
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：5（types.ts / battle.ts / enemy-ai.ts 新增 / store.ts / monsters.json）
- **未動檔案**：leveling / encounter / inventory / 所有 scenes / 其他 data JSON
- **Diff**：+97 − 13 行，順手刪除 stub `enemyChooseAction`

## 回歸測試

Cycle 1（基本戰鬥）、Cycle 2（SPD 順序 + defending）仍正常。
