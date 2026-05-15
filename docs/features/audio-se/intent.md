# 提案 Intent — Procedural sound effects via WebAudio API

## 這是什麼

加入 6-7 個基本音效，全部用 WebAudio API 程序化生成（oscillator + envelope），不依賴外部音檔：

| SE | 觸發 | 音色 |
|---|---|---|
| `attack` | 玩家普攻 / 敵人攻擊命中 | 短沖噪音 burst (~80ms) |
| `crit` | 爆擊 | 高音 + 雙拍 (~150ms) |
| `heal` | 補血 / 治癒術 | 上升正弦音 chime (~250ms) |
| `levelup` | 升等 overlay 顯示時 | 三音上升和弦 (~600ms) |
| `victory` | 戰勝結束 | 短促勝利動機 (~400ms) |
| `defeat` | 戰敗 / GameOver | 下降低音 (~500ms) |
| `menu` | 系統選單 / 對話按鈕 | 極短 blip (~30ms) |

ESC 選單加「🔇 靜音切換」按鈕，狀態存 LocalStorage。

## 為誰而做

- **所有玩家**：戰鬥有打擊感、升等有 dopamine 音、勝利有確認音
- **手機玩家**：聲音回饋取代視覺動畫的部分功能（行動裝置 fps 較慢時更明顯）
- **作者**：練習 WebAudio API + AudioContext lifecycle
- **未來 BGM cycle**：AudioContext 與音量管理基礎完成

## 解決什麼問題

遊戲到目前完全無聲。打擊只有畫面 shake、升等只有 overlay、勝利只有 log。
加入 SE 後每個關鍵動作都有對應的聽覺回饋，遊戲質感大幅提升。

## 範圈

- ✅ 新 `core/audio.ts` 模組，含 `playSE(name)` API
- ✅ 6-7 個程序化 SE
- ✅ Lazy init AudioContext（首次 playSE 時）— 處理瀏覽器 autoplay policy
- ✅ 全域靜音 toggle，狀態存 LocalStorage `browser-rpg.muted`
- ✅ ESC 選單加「🔇 靜音」/「🔊 已靜音」按鈕
- ✅ 觸發點：playerAct / enemyAct / 升等 overlay mount / GameOver / 各 modal 按鈕（選擇性）
- ❌ 不做 BGM（cycle 15+ 範圍，更複雜）
- ❌ 不加音量條（只有 toggle，簡化 UI）
- ❌ 不加自訂音色 / 玩家可調
- ❌ 不依賴外部音檔（純程序化）
- ❌ 不改既有遊戲邏輯
