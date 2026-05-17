# 驗證 Verification — Battle hit animations

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#42 — verifier comment](https://github.com/humble-man/browser-rpg/pull/42#issuecomment-4470419557)**

## 實測結果

| Case | 結果 |
|---|---|
| 玩家普攻 → enemy hit-flash + shake、player lunge-up、damage number | ✅ |
| 玩家爆擊 → enemy hit-flash + crit-impact scale、player lunge-up、damage-number.crit | ✅ |
| 玩家自治 (heal skill) → player hit-flash.heal、無 lunge、damage-number.heal | ✅ |
| 敵普攻 → player hit-flash + shake、enemy lunge-down | ✅ |
| 敵 HP=0 → phase='won'、enemy portrait `.defeated`（800ms forwards） | ✅ |
| 玩家 HP=0 → phase='lost'、player portrait `.defeated` | ✅ |
| Animation 時序：lunge 280ms / flash 350ms / portrait clean by 500ms / shake 400ms 既有 | ✅ |
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 / 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：2（`src/scenes/Battle.tsx`、`src/index.css`）
- **未動**：types / store / save / audio / systems / data / 其他 scenes / 其他 UI
- **Diff**：+106 −12 行

## 回歸測試

Cycle 1-19 全功能保留。`.combatant.shake`、`.damage-number`、SE、BGM 全部不變。
`lastDamage.kind` 在 cycle 16 加入時就已 backward compat、本 cycle 不擴 schema。

## Combat polish milestone

打擊感四件套完整 — 攻擊方 lunge、受擊方 hit-flash、爆擊 crit-impact scale、擊倒 defeated fade。
與 cycle 14 SE / cycle 16 damage numbers / cycle 19 BGM 並行，組成完整 audio-visual hit sequence。
2 條程序化動畫 + 0 外部素材依賴，與專案 procedural-first 風格一致。
