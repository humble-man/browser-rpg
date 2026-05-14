# 驗證 Verification — PWA / offline support

## 結果：✅ PASS

審查人與現場驗證記錄留在 PR：

🔍 **[humble-man/browser-rpg#14 — verifier comment](https://github.com/humble-man/browser-rpg/pull/14#issuecomment-4452553843)**

## 實測結果

| Case | 結果 |
|---|---|
| Manifest 載入（4 icons / standalone / theme）| ✅ |
| Service Worker 註冊 active | ✅ |
| Precache 12 條 （195.79 KiB）| ✅ |
| 遊戲可玩（preview 模式）| ✅ |
| TypeScript strict build | ✅ |
| Console errors / warnings | ✅ 0 |

## Design 遵循度

100% — 逐項對照見 PR 評論。

## 影響范圍

- **變動檔案**：11（package.json / vite.config.ts / index.html / pwa-assets.config.ts 新增 / 7 個 icons 新增）
- **`src/` 未動**：純 wrap 層，戰鬥/AI/lock/treasures 全部保留
- **Diff**：+67 −4 行（不含 package-lock）

## 回歸測試

Cycle 1-5 全功能保留。

## 部署提示

`npm run build` 後部署 `dist/`。
HTTPS 產級路徑上，Chrome 會出現 install icon。
未來換立繪 / icon 只要 `npm run generate-pwa-assets` 重跡即可。
