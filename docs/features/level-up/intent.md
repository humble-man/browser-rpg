# 提案 Intent — Level-up celebration overlay

## 這是什麼

當玩家在戰鬥勝利後升等時，畫面中央顯示一個 ~2 秒的 overlay：

```
┌────────────────────────┐
│        ⬆️ LEVEL UP!     │
│      Lv. 3 → Lv. 4     │
│                        │
│      +6 HP  +2 MP      │
│      +1 ATK  +1 DEF    │
└────────────────────────┘
```

Overlay fade-in 0.3s → 顯示 1.5s → fade-out 0.3s → 自動消失。
玩家可點擊任何位置跳過動畫。期間 battle 動作暫停（按鈕無反應）。

## 為誰而做

- **正在升等的玩家**：得到明確的 "you got stronger" 視覺確認
- **新玩家**：第一次升等的引導感
- **未來 SE cycle**：升等動畫播放期間是放 chime sound 的最佳時機
- **作者**：練習 CSS transition / animation orchestration + state cleanup

## 解決什麼問題

戰鬥勝利訊息現在塑了 3-4 條 log：「擊敗 X」「+Y XP」「升等！」「拾獲 Z」。
升等被埋在訊息流裡，玩家容易錯過、體感很弱。
本 cycle 把升等抽出成 cinematic moment，強化 dopamine 反饋。

## 範圈

- ✅ 新 `LevelUpOverlay` 元件
- ✅ Store 加 `pendingLevelUp` state 暫存「level 上升 + 各 stat delta」
- ✅ Victory 邏輯 set pendingLevelUp（而非馬上 push log）
- ✅ Overlay 顯示完成後自動 clear state
- ✅ 點擊跳過
- ✅ Log 訊息仍保留（不變既有行為），純粉「多」一層 overlay
- ❌ 不加音效（cycle 14 範圍）
- ❌ 不改 leveling 數值 / 公式
- ❌ 不做粒子特效 / sparkle
- ❌ 不改其他 victory log
