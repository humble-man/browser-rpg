# 設計 Design — PWA / offline support

## 1. 依賴

`package.json` devDependencies：
- `vite-plugin-pwa`
- `@vite-pwa/assets-generator`

`scripts` 加：`"generate-pwa-assets": "pwa-assets-generator"`

## 2. Icon source `assets/icon-source.svg`

512×512 暗紫背 + 金色劍 + 微光暈。見 PR diff。

## 3. `pwa-assets.config.ts`

```typescript
import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset,
  images: ['assets/icon-source.svg'],
});
```

執行 `npm run generate-pwa-assets` 後 public/ 出現：
- `pwa-192x192.png`
- `pwa-512x512.png`
- `maskable-icon-512x512.png`
- `apple-touch-icon.png` 180×180
- `favicon.svg`
- `favicon.ico`

## 4. `vite.config.ts` 變動

加 `VitePWA({ registerType: 'autoUpdate', manifest: {...}, devOptions: { enabled: false } })`。

## 5. `index.html` 小調整

只加 theme-color meta + apple-touch-icon link。Manifest link 由 plugin 自動注入。

## 6. `main.tsx` — 無變動

`registerType: 'autoUpdate'` + `injectRegister: 'auto'` 會自動注入 SW 註冊 script。

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `src/**/*` 全部 React / Zustand / 系統 / scenes / UI | 純 wrap 層 |
| `data/*.json` / `data/maps.ts` | 不影響 |

## 8. 驗證計畫

### 8.1 Build

`npm run build` 應產出 manifest.webmanifest / sw.js / registerSW.js / PNG icons。

### 8.2 瀏覽器測試 (`npm run preview`)

| Case | 預期 |
|---|---|
| Load preview | DevTools Application 看到 manifest |
| Service Worker | sw.js 已註冊 active |
| Manifest 預覽 | name 「幽影迷宮」、icons 顯示 |
| Network → Offline + reload | 仍可載入（從 SW cache）|
| Lighthouse PWA | 分數 > 80 |

### 8.3 回歸測試

Cycle 1-5 全功能在 PWA 模式下正常：
- Title / Overworld / Battle / Shop / GameOver
- SPD 順序、Boss AI、多分頁 lock、Treasures 、新地圖

## 9. 風險與緩解

- **sharp install 失敗**：fallback 為手動 PNG
- **autoUpdate 不中斷 session**：background download + 下次重啟套用
- **iOS Safari 限制**：無 banner，手動「加到主畫面」可用
- **Lighthouse 分數**：若不足 80 調整 manifest 缺漏項

## 10. 時間預算

~1.5 hr。
