# 驗證 Verification — NPC dialog system

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#22 — verifier comment](https://github.com/humble-man/browser-rpg/pull/22#issuecomment-4460306100)**

## 實測結果

| Case | 結果 |
|---|---|
| 3 NPC tile 渲染 emoji | ✅ 👴 / 🧙‍♂️ / 👩‍🍳 |
| 走進村長 (2,2) | ✅ line 1 of 3 |
| Enter / 點擊推進 | ✅ 兩種都可 |
| 最後句按鈕變「關閉」 | ✅ |
| 點關閉回 overworld | ✅ |
| 神秘冒險者 (8,4) | ✅ |
| 旅店老闆娘 (3,6) | ✅ |
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：6（types.ts / maps.ts / store.ts / DialogModal.tsx 新增 / Overworld.tsx / index.css）
- **未動檔案**：save.ts 、Battle 、Shop 、Title 、GameOver 、systems 全部
- **Diff**：+173 −5 行

## 回歸測試

Cycle 1-9 全功能保留。activeDialog 不入 save 避免 reload 卡 mid-dialog。

## 世界感提升

村莊從「shop + inn + 門」變成「有 3 個會說話的人」。
未來 cycle 可在此基礎上加 quest 系統 、分支選擇 、NPC 商店。
