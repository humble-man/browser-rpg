# 驗證 Verification — Maps expansion + treasure chests

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#13 — verifier comment](https://github.com/humble-man/browser-rpg/pull/13#issuecomment-4452035106)**

## 實測結果

| Case | 結果 |
|---|---|
| 村莊 12×10 渲染 / 120 tiles / spawn (5,4) | ✅ |
| (7,7) 拾取鐵劍 | ✅ |
| 步離寶箱 glyph 變空 | ✅ |
| 重踩空寶箱 | ✅ |
| 迷宮 15×12 渲染 / 180 tiles / spawn (2,1) | ✅ |
| (11,5) potion×3 | ✅ |
| (12,8) ether×2 | ✅ |
| (12,10) boss 觸發 | ✅ |
| 3 flags 持久化 | ✅ |
| 舊 save wall(0,0) → 自動回 spawn | ✅ |
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：5（types.ts / maps.ts / store.ts / Overworld.tsx / index.css）
- **未動檔案**：所有 systems (battle/encounter/inventory/leveling/enemy-ai) / scenes 以外 / session-lock
- **Diff**：+85 −23 行

## 回歸測試

Cycle 1 / 2 / 3 / 4 功能仍正常。

## 留待 cycle 6

- NPC 對話系統
- 第二個商店
- mini-boss
- 隱藏房 / 機關
