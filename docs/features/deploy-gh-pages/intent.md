# 提案 Intent — Deploy to GitHub Pages

## 這是什麼

把 browser-rpg 部署到 GitHub Pages，透過 GitHub Actions 在每次 push 到 `main` 時自動 build + deploy。

完成後 URL: **`https://humble-man.github.io/browser-rpg/`**

## 為誰而做

- **玩家**：終於可以實際打開 URL 玩遊戲、分享給朋友
- **PWA 測試**：cycle 6 的 install 流程需要 HTTPS，localhost 雖然例外但無法手機實測
- **作者**：練習 GitHub Actions / Pages 部署
- **未來開發**：每次 push 自動 deploy，後續 cycle 改動立即上線

## 解決什麼問題

Cycle 6 PWA 雖然完整，但只跑在 localhost，無法：
- 分享 URL 給朋友
- 手機 PWA 安裝測試
- 從非開發機器存取

本 cycle 解決「URL 化」這個最後一哩。

## 範圈

- ✅ Repo 轉 public（user 手動）
- ✅ 一個 GitHub Actions workflow：build + deploy 到 GitHub Pages
- ✅ Vite base path 適配 GitHub Pages 子路徑（`/browser-rpg/`）
- ✅ PWA manifest scope / start_url 適配子路徑
- ✅ 部署後實機驗證遊戲、PWA、SW 在線上版本正常
- ❌ 不做 custom domain（需要 user 有 domain）
- ❌ 不做 staging / preview 環境（過度範圍）
- ❌ 不做版本控管 / rollback 機制（GitHub Actions history 已夠用）
- ❌ 不改遊戲邏輯 / UI
