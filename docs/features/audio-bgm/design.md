# 設計 Design — Background music

## 1. Types + Patterns

`BgmTrack = 'overworld' | 'battle'`
`BgmPattern = { bpm, totalBeats, notes[] }`

Overworld：BPM 80、C major、8 主旋律音 (triangle) + 4 bass (sawtooth)、16 拍 loop。
Battle：BPM 120、D minor、16 主旋律音 (square) + 4 bass (sawtooth)、16 拍 loop。

見實作代碼。

## 2. Scheduler + lifecycle

- `ensureMasterGain` lazy init bgmMasterGain
- `playNote(ac, note, when, bpm)` oscillator + envelope、連接到 master gain
- `scheduler()` lookahead 100ms、每 25ms loop
- `startBgm(track)` crossfade 舊→新、idempotent、重設 currentBeat=0
- `stopBgm()` fade out、清 timer

## 3. Mute 整合

`setMuted` 加 BGM master gain 平滑跳變 (0 / BGM_MASTER_VOLUME, 0.2s ramp)。

## 4. Scene 整合

- Overworld.tsx useEffect mount → startBgm('overworld')
- Battle.tsx useEffect mount → startBgm('battle')
- Title.tsx mount → stopBgm
- GameOver.tsx mount → stopBgm

## 5. 不動的部分

| 模組 | 為何不動 |
|---|---|
| store / save / types | BGM 不入 state |
| systems / data | 不涉及 |
| index.css | 純 audio、無 UI |
| SE 邏輯 | 不變、並存 |

## 6. 驗證計畫

9 case 見 PR 評論。

## 7. 風險

- 音樂品質—最簡單 loop、驗證階段調整
- Scheduler 累積—idempotent
- Mute 平滑—linearRamp 0.2s
- AudioContext suspended—getCtx 處理
