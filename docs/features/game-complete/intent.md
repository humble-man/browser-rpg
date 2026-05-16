# 提案 Intent — Game completion celebration

## 這是什麼

當玩家領完村長獎勵 (`quest-elder-rewarded` flag 首次設立) 時，
顯示一次性的全螢幕 capstone overlay：

```
┌─────────────────────────────┐
│      🏆 碧楓村得救了        │
│                             │
│    最終等級   Lv. 6         │
│    持有金幣   👜 624 G      │
│    擊敗迷霧獵手  ⚔️ ✓       │
│    擊敗幽魂龍   🐉 ✓        │
│                             │
│   謝謝你完成這個冒險。      │
│                             │
│   [⚔️ 繼續探索]  [↩ 回標題] │
└─────────────────────────────┘
```

Overlay 只在「**這一次**領獎」時觸發，重新進入遊戲不會重複顯示（用 flag `game-completion-shown` 區分）。

## 為誰而做

- **完成主線的玩家**：得到明確的「你贏了」反饋 + 統計
- **想分享進度的玩家**：截圖統計畫面分享
- **作者**：narrative loop 完整收尾

## 解決什麼問題

Cycle 11 quest 領完獎只 push 一條訊息「💰 獲得獎勵 500G」，然後遊戲繼續。
玩家可能不知道自己「已通關」。本 cycle 補一個明確的 capstone 慶祝。

## 範圈

- ✅ 新 `GameCompleteOverlay` 元件
- ✅ `quest-elder-rewarded` 觸發時 set `pendingGameComplete` state
- ✅ 顯示 final stats (Lv / Gold / mini-boss / boss)
- ✅ 兩個按鈕：繼續探索 / 回標題
- ✅ Flag `game-completion-shown` 防重複（領一次獎只看一次）
- ❌ 不加 BGM 結束曲（cycle 14 範圍 SE 已支援，可加 victory chime）
- ❌ 不改 quest 邏輯
- ❌ 不加 multi-ending（單一通關線）
- ❌ 不開啟「new game+」模式（保留 open-ended）
