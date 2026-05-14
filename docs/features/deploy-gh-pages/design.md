# 設計 Design — Deploy to GitHub Pages

## 1. `vite.config.ts` 變動

把 `base: './'` 改為 conditional：

```typescript
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/browser-rpg/' : '/',
  plugins: [react(), VitePWA({ /* cycle 6 配置 */ })],
  server: { host: '127.0.0.1', port: 5173 },
}));
```

## 2. `.github/workflows/deploy.yml`

build job（checkout + setup-node + npm ci + npm build + configure-pages + upload-artifact）+ deploy job（deploy-pages）。見 PR diff。

關鍵 actions：
- `actions/checkout@v4`
- `actions/setup-node@v4` with cache
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

權限：
- `pages: write`
- `id-token: write`

## 3. README 加 play URL

頂部加：`🌐 Play online: https://humble-man.github.io/browser-rpg/`

## 4. 不動的部分

| 模組 | 為何不動 |
|---|---|
| `src/**/*` | 純部署，不改邏輯 |
| `manifest` / `sw.js` | VitePWA 根據 vite base 自動適配 |
| 其他 config files | 不需改 |

## 5. 驗證計畫

### 5.1 Local build

`npm run build` 後 `grep -r 'browser-rpg' dist/` 應讀到众多路徑包含 `/browser-rpg/`。

### 5.2 Local serve

`npm run preview` 應能在 `localhost:4173/browser-rpg/` 跑。

### 5.3 線上 deploy

Push 後 Actions 跑完、開 `https://humble-man.github.io/browser-rpg/`：
- Title 畫面出現
- Manifest / SW / cache 正常
- Offline reload 仍可載入
- 遊戲全流程可玩

### 5.4 PWA install verify

- Chrome 桌面右上 install icon
- 點安裝、独立視窗出現

### 5.5 回歸測試

Cycle 1-6 全功能在線上版本仍正常。

## 6. 前置步驟（user 手動）

⚠️ workflow 第一次跑前 user 必須完成：

1. **轉 repo 為 public**：Settings → General → Change visibility → Public
2. **設 Pages source**：Settings → Pages → Source → **GitHub Actions**

若沒設好，workflow 會跑成功但 Pages 仍 404。

## 7. 風險

- **base path 不一致**：conditional base 處理；verify 階段 local build + grep
- **首次 Pages 設定漏掉**：PR 描述明列
- **autoUpdate SW 更新慢**：documented behavior
