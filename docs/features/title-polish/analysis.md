# 分析 Analysis — Title screen polish

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 玩家首次打開遊戲 | 標題畫面顯示 logo + subtitle + 4 功能按鈕 + 音效 toggle + footer |
| 點音效 toggle | 切換 mute / unmute、LocalStorage 同步、跟 ESC 選單一致 |
| 點 GitHub link | 開新分頁到 repo |
| 點功能按鈕 | 既有行為不變（新遊戲 / 載入 / 匯入 / 刪除）|
| 遊戲中回標題 | 同樣顯示 |

## 2. 版本號取得方式

選**方案 A**：vite.config.ts 加 `define: { __APP_VERSION__: JSON.stringify(pkg.version) }`。
需同時 declare global type 避免 TS 編譯錯。
package.json bump 0.1.0 → 0.12.0 對齊 tag。

## 3. UI 結構

```tsx
<div className="title-scene">
  <div className="title-banner">⚔️ 幽影迷宮 ⚔️</div>
  <div className="title-subtitle">─ 碧楓村的傳說 ─</div>
  <div className="title-menu">{/* 4 個按鈕 */}</div>
  <div className="title-audio-toggle">{/* mute toggle */}</div>
  <footer className="title-footer">v{__APP_VERSION__} · GitHub</footer>
</div>
```

## 4. 音效 toggle

複用 cycle 14 isMuted/setMuted。useState mirror 狀態。
Title / Overworld 各自 mount、LocalStorage 為 source of truth。

## 5. CSS

- `.title-banner` flex row + 裝飾
- `.title-subtitle` 字級小、淡紫、letter-spacing
- `.title-audio-toggle` margin-top 区隔
- `.title-footer` 底部置中、灰、含 GitHub link

## 6. 模組架構

| 檔案 | 變動 |
|---|---|
| `package.json` | version bump → 0.12.0 |
| `vite.config.ts` | define `__APP_VERSION__` |
| `src/scenes/Title.tsx` | 重構 |
| `src/index.css` | 新增 .title-* class |
| `src/vite-env.d.ts` | declare global `__APP_VERSION__` |

不動：types / save / store / 其他 scenes / systems / data

## 7. 邊界案例

- mute 跨 scene：LocalStorage truth
- GitHub link：target="_blank" rel="noopener"
- vite define：TS declare 要位
- package.json bump：未來 release 需手動

## 8. 約束

- 不破壞 4 個功能按鈕
- 不引入新依賴
- ~45 min + 15 min 驗證

## 9. 風險

- vite define TS declare 需位
- package.json 與 tag 漂移 — 接受
- mute toggle 雙入口不同步 — LocalStorage truth、可接受
- subtitle 字長 — 驗證階段視覺調整
