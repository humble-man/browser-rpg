# 提案 Intent — Background music (BGM) via WebAudio

## 這是什麼

加入 2 條程序化背景樂，全部用 WebAudio API 動態生成（oscillator + scheduler），不依賴外部音檔：

- **Overworld BGM**：平靜探索曲，~8 小節 loop，主旋律 + 簡單 bass
- **Battle BGM**：緊張戰鬥曲，~8 小節 loop，較快節奏 + 較豐富音色

場景切換時 fade-out 舊 BGM → fade-in 新 BGM (~500ms crossfade)。
mute 切換時 BGM 跟著靜音（複用 cycle 14 isMuted/setMuted）。
標題畫面靜音（避免 autoplay policy 衝突 + 不打擾）。

## 為誰而做

- **所有玩家**：retro RPG 該有的 chiptune 氛圍
- **沉浸體驗**：戰鬥音樂讓緊張感清晰、探索音樂讓平靜感清晰
- **作者**：練習 WebAudio scheduler + tempo sync

## 解決什麼問題

Cycle 14 加了 SE 但遊戲仍偏静—沒有背景音樂時，戰鬥之間是「無聲走動」，與 retro RPG 經典體驗有落差。
本 cycle 補上 BGM，完成 audio dimension。

## 範圈

- ✅ Overworld BGM（8 小節 loop）
- ✅ Battle BGM（8 小節 loop）
- ✅ Scene 切換 crossfade
- ✅ 複用 cycle 14 AudioContext + mute toggle
- ✅ 標題畫面無 BGM
- ❌ 不加 boss / mini-boss 專屬 BGM（過度範圍，留 future）
- ❌ 不加用戶可選擇主題（單一 BGM 設計）
- ❌ 不加音量條（沿用 cycle 14 mute toggle）
- ❌ 不依賴外部音檔（純程序化）
- ❌ 不改 SE / 既有遊戲邏輯
