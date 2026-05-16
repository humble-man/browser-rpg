# 分析 Analysis — Background music

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 標題畫面 | 無 BGM |
| 進 overworld | Overworld BGM fade-in |
| 觸發戰鬥 | Crossfade 到 Battle BGM |
| 戰鬥結束 → overworld | Crossfade 回 Overworld BGM |
| 進 GameOver | BGM fade-out |
| 回標題 | BGM 停止 |
| Mute toggle | BGM 跟著靜音 |

## 2. WebAudio scheduler

標準 lookahead scheduler：每 25ms 檢查、預訂 100ms 內音符、以 ctx.currentTime 為基準避免 setTimeout drift。

## 3. 音樂內容

### 3.1 Overworld (BPM 80, 4 小節 = 16 拍, C major)

Lead (triangle, 2 拍一音):
- beat 0: C5, 2: E5, 4: G5, 6: E5
- beat 8: A5, 10: G5, 12: F5, 14: E5

Bass (sawtooth, 4 拍一音):
- beat 0: C3, 4: F3, 8: A3, 12: G3

### 3.2 Battle (BPM 120, 4 小節 = 16 拍, D minor)

Lead (square, 1 拍一音):
- beat 0-3: D5 F5 A5 F5
- beat 4-7: A5 F5 D5 F5
- beat 8-11: G5 Bb5 D6 Bb5
- beat 12-15: A5 F5 D5 C5

Bass (sawtooth, 4 拍一音):
- beat 0: D3, 4: D3, 8: G3, 12: A3

## 4. 模組架構

| 檔案 | 變動 |
|---|---|
| `src/core/audio.ts` | 加 BgmPattern type + 2 patterns + scheduler + startBgm/stopBgm + bgmMasterGain |
| `src/scenes/Overworld.tsx` | useEffect mount startBgm('overworld') |
| `src/scenes/Battle.tsx` | useEffect mount startBgm('battle') |
| `src/scenes/Title.tsx` | mount 時 stopBgm |
| `src/scenes/GameOver.tsx` | mount 時 stopBgm |

## 5. Mute 整合

加 bgmMasterGain node、受 setMuted control。gain.setTargetAtTime 平滑跳變。

## 6. 邊界案例

- startBgm idempotent（同 track 不重啟）
- 快速切換 crossfade 不堆積
- AudioContext suspended 需 user gesture resume（同 SE）
- BGM 音量較 SE 低（避免蓋過 SE feedback）

## 7. 音量結構

```
[Voices] → [Voice Gain] → [BGM Master Gain (mute control)] → [Destination]
```

BGM master 0.1-0.15、SE 0.2-0.25。

## 8. 約束

- 純程序化、零外部依賴
- iOS 相容（sycle 14 webkitAudioContext 已處理）
- 不阻擋 game logic
- 時間預算：~2 hr + 30 min 驗證

## 9. 風險

- 音樂品質—純程序化易難聽，先做最簡單 loop、驗證階段調整
- Scheduler drift—ctx.currentTime 基準避免
- autoplay policy—lazy init、需 user gesture
- 多重 scheduler—全域唯一、避免重疊
- Performance—每秒數個 oscillator，可接受
