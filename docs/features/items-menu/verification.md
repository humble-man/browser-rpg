# 驗證 Verification — Use consumables outside battle

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#20 — verifier comment](https://github.com/humble-man/browser-rpg/pull/20#issuecomment-4459301585)**

## 實測結果

| Case | 結果 |
|---|---|
| ESC 選單 6 按鈕順序 | ✅ |
| 點 🧪 modal 開 | ✅ |
| 新遊戲清單（3×補血 + 1×魔力）| ✅ |
| 點使用補血藥水 → count 3→2 | ✅ |
| 訊息「使用補血藥水 — 回復 0 HP」 | ✅ |
| 關閉 → 回 overworld | ✅ |
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：4（ItemsModal.tsx 新增 、Overworld.tsx 、store.ts 、index.css）
- **未動**：inventory 、Battle 、Shop 、types 、所有 data
- **Diff**：+86 −1 行

## 回歸測試

Cycle 1-8 全功能保留。戰鬥內道具流程不變。

## UX 修復

跟 cycle 8 同類漏洞補完：「inventory 上的東西應該随時能用」。
ESC menu 現有 🎒 裝備 + 🧪 道具 雙入口，形成一致 UX pattern。
