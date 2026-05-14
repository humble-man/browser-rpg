# 分析 Analysis — Deploy to GitHub Pages

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| Push 到 main | Actions 自動觸發 build + deploy，~2-3 分鐘後線上版本更新 |
| 玩家打開 URL | 載入遊戲，與 localhost 體驗一致 |
| 玩家手機 Chrome 訪問 | 第二次訪問出現 Add to Home Screen banner |
| 從桌面 icon 啟動 PWA | standalone 、全螢幕、theme color |
| 關 WiFi 後重訪 | SW cache 仍可載入 + 遊玩 |
| 分享 URL 給朋友 | 朋友打開即玩 |

## 2. GitHub Pages 機制

- **Pages 子路徑**：`humble-man.github.io/browser-rpg/`（user-site 限制，每個 repo 一個子目錄）
- **Source**：透過 Actions deploy（非舊式 gh-pages branch）
- **HTTPS**：自動提供，且 SW 需求滿足
- **Quotas**：每月 100GB bandwidth + 10 builds/hour

## 3. Vite base path 適配

當前設 `base: './'`：可運作。改為 conditional `'/browser-rpg/'`（生產）+ `'/'`（dev）並存。

```typescript
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/browser-rpg/' : '/',
  // ...
}));
```

## 4. PWA 適配

VitePWA 自動讀 vite `base`，不需手改 manifest scope / start_url。

## 5. GitHub Actions Workflow

build + deploy 兩 job，使用 `actions/configure-pages`, `upload-pages-artifact`, `deploy-pages` 官方 actions。見 design 詳細語法。

## 6. 邊角案例

- **首次 deploy 前 Pages source 需設為 GitHub Actions**：user 手動
- **PWA SW cache 衝突**：`autoUpdate` 已處理
- **base path 不一致**：conditional base 處理
- **絕對 URL 寫死在 source**：grep 確認 src/ 沒有寫死
- **icon 引用**：Vite 重寫，manifest 相對路徑自動 OK
- **CI cache**：setup-node `cache: 'npm'` 加速

## 7. 模組架構

| 檔案 | 變動 |
|---|---|
| `.github/workflows/deploy.yml` | **新檔** workflow |
| `vite.config.ts` | base 改為 conditional |
| `README.md` | 加 deploy URL 說明 |
| 其他 | 不動 |

## 8. 約束

- GitHub Pages quotas 足夠
- public repo 上 Actions 免費
- build 時間 ~1.5 分鐘
- deploy latency ~2-3 分鐘
- 時間預算：30 min workflow + 30 min 驗證

## 9. 風險

- **首次 deploy 失敗**：Pages source 未設 / permissions / base path。分步驗證
- **PWA SW 卡舊版**：autoUpdate + cache key 含 hash
- **base 設錯空白頁**：verify network tab
- **手動前置漏**：PR 描述明列
