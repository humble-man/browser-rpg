# 分析 Analysis — PWA / offline support

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 桌面 Chrome 進站 | 網址列右側出現 install icon；點擊安裝 |
| Android Chrome 進站 | 第二次訪問後 banner 出現「Add to Home Screen」 |
| iOS Safari 進站 | 無 native install banner（iOS 限制），但 manifest 仍生效，用「分享 → 加到主畫面」可安裝 |
| 安裝後從 home screen 啟動 | 全螢幕、無瀏覽器 UI、theme color 為 app bar |
| 離線開啟（已快取）| 標題畫面、地圖、戰鬥、商店全部可玩 |
| 線上更新部署 | SW 偵測新版本 → 下次重啟自動套用 |
| LocalStorage 存檔 | 線上 / 離線 / PWA 模式行為一致 |

## 2. PWA 技術元件

| 元件 | 用途 | 自動程度 |
|---|---|---|
| **manifest.webmanifest** | App 名稱、icon、theme、display mode | 手寫配置 |
| **Service Worker (sw.js)** | 攜截 fetch、cache 靜態資源 | workbox 自動產生 |
| **Icons (PNG/SVG)** | 桌面 / app drawer / splash screen | `@vite-pwa/assets-generator` 從 SVG 自動生 |
| **registerSW.js** | 註冊 SW、更新提示 | vite-plugin-pwa 注入 |

## 3. Manifest 內容（規劃）

name / short_name / description / theme_color / background_color / display: standalone /
start_url / icons (192/512/maskable)

## 4. Icon 設計

源 SVG：
- 512×512 square
- 背景漸層：`#2a1a4d` → `#1a1230`
- 中央元素：金色的劍 + 一抹紫色魔法光暈
- 風格：簡潔有辨識度、縮小到 32px 仍可辨

安裝在 `assets/icon-source.svg`，build 時自動生成：
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/maskable-icon-512x512.png`
- `public/apple-touch-icon.png`
- `public/favicon.svg`

## 5. Service Worker 策略

`vite-plugin-pwa` 的 `generateSW` 模式（基於 workbox）：
- **precache**：build 產出的所有靜態資源（HTML / JS / CSS / icons）
- **runtime cache**：無，因為遊戲不發 API 請求
- **更新策略**：`registerType: 'autoUpdate'`（新版部署自動取代）
- 不需手寫 sw.js

## 6. 邊界案例

- **首次訪問**：尚無 SW → 一般網頁載入；同時註冊 SW；下次起可離線
- **iOS Safari 限制**：無 install banner，但 manifest 仍有效（影響 home screen icon + 啟動畫面）
- **更新時機**：autoUpdate 模式下，新 SW 在背景下載，下次重啟才啟用
- **快取爆炸**：所有資源 ~185KB JS + 12KB CSS + icons，總計 < 300KB，無 quota 壓力
- **dev mode**：vite-plugin-pwa 預設 dev mode 不啟用 SW（避免污染快取）
- **base path**：vite.config.ts 已設 `base: './'`，PWA manifest 的 start_url 相對路徑配合

## 7. 與既有系統的接點

| 模組 | 變動類型 |
|---|---|
| `package.json` | 加 `vite-plugin-pwa` + `@vite-pwa/assets-generator` (dev deps) |
| `vite.config.ts` | 加 `VitePWA()` plugin + manifest config |
| `assets/icon-source.svg` | **新檔** SVG icon source |
| `public/pwa-*.png` | **新檔（auto-gen）** PNG icons |
| `index.html` | 加 theme-color meta（plugin 可自動注入 manifest link）|
| `pwa-assets.config.ts` | **新檔** assets generator config |

不動：所有 scenes / store / save / systems / data / lock / AI / battle。

## 8. 約束

- **HTTPS in prod**：Service Worker 規範要求；localhost 例外
- **bundle 不變**：PWA 只是包裝層，遊戲 JS 不增不減（icon 增 ~30KB）
- **iOS 限制**：無 install banner，仍能用「加到主畫面」
- **時間預算**：1.5–2 小時實作 + 0.5 小時驗證 (Lighthouse + 離線測試)

## 9. 風險

- **Icon 生成依賴**：`@vite-pwa/assets-generator` 需 sharp（imagemin），install 失敗時降級為手動 PNG。**驗證階段**確認 install 成功
- **SW dev hotreload 衝突**：dev mode 預設關 SW，避免問題
- **舊瀏覽器**：IE/舊 Safari 不支援 SW → 降級為一般網頁，仍可玩
- **Cycle 4 多分頁 lock 衝突**：PWA standalone 模式仍可開多個 windows（少見但可能）→ lock 行為不變，正常運作
- **icon 視覺風格**：我會用 SVG 寫一個合理的版本；不滿意可以後續換掉
