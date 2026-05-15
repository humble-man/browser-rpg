# 分析 Analysis — Procedural sound effects

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 首次進入遊戲（標題畫面）| 無聲（autoplay policy 禁止）|
| 玩家第一次點任何按鈕 | AudioContext 初始化、之後 SE 正常播放 |
| 戰鬥攻擊命中 | 短沖噪音 SE |
| 戰鬥爆擊 | 高音雙拍 SE（與一般攻擊區分）|
| 補血 / 治癒 | 上升 chime |
| 升等 overlay 顯示時 | 三音上升和弦 |
| 戰勝結束 | 短勝利音 |
| 戰敗 → GameOver | 下降低音 |
| ESC 選單按鈕 | 極短 blip |
| 點靜音 → 後續操作 | 無聲 |
| Reload | 靜音狀態持久化 |

## 2. WebAudio API 基礎

### 2.1 AudioContext lifecycle

- 瀏覽器 autoplay policy：AudioContext 必須在 user gesture 後啟動
- Lazy init：首次 playSE() 時 new AudioContext() 並 resume()
- 一個全域 AudioContext 即可

### 2.2 程序化 SE 結構

每個 SE 由 oscillator (或 noise buffer) + GainNode envelope 組成。

## 3. SE 音色設計

| SE | 實作概念 |
|---|---|
| `attack` | White noise burst, 80ms, low-pass filter ~1000Hz |
| `crit` | Square wave 800Hz → 1200Hz, 150ms, 雙脈衝 |
| `heal` | Sine 440 → 880Hz 滑音, 250ms, soft envelope |
| `levelup` | Triangle 440 / 554 / 659 / 880Hz 順序播放, 600ms total |
| `victory` | Square 660 → 880 雙音 staccato, 400ms |
| `defeat` | Sine 440 → 110Hz 下降滑音, 500ms |
| `menu` | Sine 800Hz, 30ms, sharp envelope |

各 SE 音量約 0.15-0.3。

## 4. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/core/audio.ts` | **新檔** AudioContext + playSE + setMuted + isMuted |
| `src/core/store.ts` | playerAct 攻擊 / 補血、enemyAct 攻擊 等觸發 playSE |
| `src/ui/LevelUpOverlay.tsx` | mount 時 playSE('levelup') |
| `src/scenes/Battle.tsx` | victory phase 切換時 playSE('victory')、'lost' 時 playSE('defeat') |
| `src/scenes/Overworld.tsx` | ESC 選單加靜音按鈕 + ESC 開時 playSE('menu') |

## 5. 靜音狀態管理

- LocalStorage key `browser-rpg.muted`（boolean string）
- audio.ts module 自己 read / write，不入 Zustand store
- Overworld.tsx 用 useState(isMuted()) 鏡像狀態供 UI 顯示

## 6. 邊界案例

- **AudioContext 未初始化**：playSE 內檢查、若 ctx === null 跳過
- **第一次來不及**：lazy init 在 playSE 內、若 ctx.state === 'suspended' 呼 resume()
- **音效堆疊**：多個 SE 同時播放 OK
- **靜音時**：playSE 開頭 if (isMuted()) return
- **iOS Safari**：AudioContext 要在 user gesture handler 內初始化

## 7. 觸發點清單

| 動作 | SE | 位置 |
|---|---|---|
| 玩家普攻 | attack (+ crit) | store.ts playerAct |
| 玩家技能 | attack | store.ts playerAct skill |
| 玩家補品 / 治癒 | heal | store.ts playerAct item / useItem |
| 敵人攻擊 | attack (+ crit) | store.ts enemyAct |
| 升等 | levelup | LevelUpOverlay useEffect |
| 戰勝 | victory | Battle.tsx useEffect phase='won' |
| 戰敗 | defeat | Battle.tsx useEffect phase='lost' |
| ESC 選單開 | menu | Overworld onKey 'escape' |
| 對話 advance | menu | DialogModal advance |

## 8. 約束

- 不依賴外部音檔
- 不阻擋 game logic
- iOS 相容
- ~1.5 hr + 30 min 驗證

## 9. 風險

- autoplay policy：lazy init + try/catch
- 音色平衡：驗證階段調整
- 過頻觸發：偶爾動作可寨、接受
- 狀態同步：useState 鏡像處理
