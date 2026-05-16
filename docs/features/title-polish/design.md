# 設計 Design — Title screen polish

## 1. package.json

version 0.1.0 → 0.12.0。

## 2. vite.config.ts 加 define

```typescript
import pkg from './package.json';
// ...
define: {
  __APP_VERSION__: JSON.stringify(pkg.version),
}
```

## 3. vite-env.d.ts

```typescript
declare const __APP_VERSION__: string;
```

## 4. Title.tsx 重構

- `.title-banner` 含 ⚔️ 裝飾 + h1 標題
- `.title-subtitle` 「─ 碧楓村的傳說 ─」
- `.title-menu` 保留 4 個功能按鈕
- `.title-audio-toggle` 另一個區塊、useState mirror isMuted()
- `.title-footer` `v{__APP_VERSION__}` + GitHub link

## 5. CSS

- `.title-banner` flex row + deco、`.title-main` 金色大字 + glow
- `.title-subtitle` 淡紫 + letter-spacing 0.3em
- `.title-audio-toggle` margin-top 18px
- `.title-footer` 灰色 11px + .title-footer a 金色

## 6. 不動的部分

| 模組 | 為何不動 |
|---|---|
| store / audio / 其他 scenes / systems / data | 不涉及 |
| 4 個功能按鈕邏輯 | 保留 |

## 7. 驗證計畫

6 case 見 PR 評論。

## 8. 風險

- vite define TS declare 需位
- pkg JSON import 需 Vite 5 支援
- mute 雙入口不同步 — LocalStorage truth
- subtitle 長度視覺調整
