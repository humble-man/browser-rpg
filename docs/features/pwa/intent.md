# 提案 Intent — PWA / offline support

## 這是什麼

把 browser-rpg 升級為 Progressive Web App（PWA）：
- **可安裝**：手機 Chrome / 桌面 Edge 等支援的瀏覽器會出現「加到桌面」按鈕
- **離線可玩**：service worker 快取所有靜態資源，斷網仍能繼續遊戲
- **app-like 體驗**：開啟後無瀏覽器 chrome（網址列、tab bar），全螢幕沉浸
- **桌面 icon**：自訂 icon 取代瀏覽器預設的網頁縮圖

## 為誰而做

- **行動裝置玩家**：地鐵 / 飛機沒網路也能玩
- **想「裝起來」的玩家**：標題加到手機桌面或桌面捷徑，每天打開像 app 一樣
- **未來分享 URL 場景**：朋友收到連結後可「Add to Home Screen」獲得 native 體驗
- **作者**：練習 PWA / Service Worker / manifest 配置

## 解決什麼問題

`docs/analysis.md` §3 (cycle 1) 列「無網路使用」為邊界案例，並提到 PWA 可解。
目前 MVP 雖然首次載入後瀏覽器會自動快取，但：
- 不保證離線可運作（依瀏覽器快取策略）
- 無法「裝起來」（沒 manifest）
- 看起來仍是「網頁」而非「app」

## 範圈

- ✅ 加 `vite-plugin-pwa`（dev dep）
- ✅ 配置 manifest（name / theme / icons / display: standalone）
- ✅ Service worker 自動產生（workbox），快取所有靜態資源
- ✅ Icon SVG（單一 source）→ 自動產生 192×192 / 512×512 PNG（via `@vite-pwa/assets-generator`）
- ✅ Lighthouse PWA 分數目標 > 80（不強制 90）
- ❌ 不做 push notifications（過度範圍）
- ❌ 不做 background sync（用不到，純單機）
- ❌ 不改變現有遊戲邏輯（純前端 wrap）
- ❌ 不做雲端存檔（仍 LocalStorage）
