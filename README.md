# browser-rpg · 幽影迷宮

> A classic turn-based RPG playable directly in the browser. 2D cartoon style, no install required.

打開瀏覽器即玩的回合制冒險：探索 → 隨機遇敵 → 回合戰鬥 → 升等 → 商店 → 打倒迷宮頭目。

## 開始遊玩

```bash
npm install
npm run dev
# 開啟 http://127.0.0.1:5173
```

或 build static bundle：

```bash
npm run build
npm run preview
```

## 操作

| 動作 | 鍵盤 | 觸控 |
|---|---|---|
| 移動 | 方向鍵 / WASD | 螢幕右下方向鍵 |
| 系統選單（存檔 / 匯出 / 回標題）| `Esc` | 螢幕右下中央 ≡ |
| 戰鬥動作 | 滑鼠點按鈕 | 點按鈕 |

## 流程

1. **標題畫面** → 輸入名字 → 新遊戲 / 載入存檔 / 匯入 JSON
2. **碧楓村**（10×8）→ 商店、旅館（10G 補滿 HP/MP）、迷宮入口
3. **幽影迷宮**（10×8）→ 18% 機率隨機遇敵（史萊姆 / 哥布林 / 骷髏 / 巨蜘蛛）
4. **戰鬥** → 攻擊 / 火球（5MP）/ 治癒（4MP）/ 道具 / 防禦 / 逃跑
5. **頭目** → 幽魂龍（不能逃，必須擊敗）
6. **GameOver** → 回標題或從上次存檔繼續

## 存檔

- 自動：戰鬥勝利後 / 進村 / 旅館休息
- 手動：`Esc` → 💾 存檔
- 跨裝置：`Esc` → 📤 匯出存檔（複製到剪貼簿）→ 在標題畫面 📥 匯入

## 技術棧

- **Vite 5** + **TypeScript 5** + **React 18**
- **Zustand 4** + **Immer 10** （全域遊戲狀態，draft mutation）
- 純前端 / DOM render，無 Canvas
- LocalStorage 存檔 `browser-rpg.save.v1`

## 五階段開發紀錄

本專案以 `harness-engineering` skill 驅動，分為五個 stage：

| Stage | 文件 |
|---|---|
| 提案 intent | [`docs/intent.md`](docs/intent.md) |
| 分析 analysis | [`docs/analysis.md`](docs/analysis.md) |
| 設計 design | [`docs/design.md`](docs/design.md) |
| 驗證 verify | PR comments |
| 完成 done | issue 關閉 |

## 模組結構

```
src/
├── core/        types · store (Zustand+Immer) · save/load · rng
├── data/        monsters.json · items.json · skills.json · maps.ts
├── systems/     battle · encounter · inventory · leveling
├── scenes/      Title · Overworld · Battle · Shop · GameOver
├── ui/          HpBar · MenuButton · DialogueBox · DamageNumber
└── App.tsx + main.tsx + index.css
```
