# 分析 Analysis — Game completion celebration

## 1. 使用情境

| 場景 | 預期行為 |
|---|---|
| 首次點「💰 領取獎勵」 | gold +500、rewarded=true、overlay 出現、completion-shown=true |
| Overlay 顯示中 | 全螢幕 4 項統計、兩個按鈕 |
| 點「繼續探索」 | overlay 關閉、回 overworld |
| 點「回標題」 | resetToTitle |
| 領完獎後 reload | overlay 不再出現 |
| 第二次見村長（已 rewarded）| 「謝謝你⋯」單句，無 overlay |
| 新遊戲 | flag 重置，再領獎重新顯示 |

## 2. 資料模型

### 2.1 兩個 flag 角色

- `quest-elder-rewarded` (cycle 11)：金錢入帳、永久 true
- `game-completion-shown` (新)：通關 overlay 已展示過、防重複

### 2.2 transient state

```typescript
pendingGameComplete: boolean | null;
```

不入 save。縪鍶例同 pendingLevelUp / activeDialog。

### 2.3 顯示資料

Overlay 元件 mount 時即時讀 store (player.level / gold / flags / bossDefeated)。

## 3. 觸發點

`handleDialogChoice('claim-reward')` 邏輯：

```typescript
if (s.flags[QUEST_DONE] && !s.flags[QUEST_REWARD]) {
  s.player.gold += 500;
  s.flags[QUEST_REWARD] = true;
  s.messages.push('💰 獲得獎勵 500G！');
  if (!s.flags['game-completion-shown']) {
    s.flags['game-completion-shown'] = true;
    s.pendingGameComplete = true;
  }
}
```

## 4. UI 結構

- header：🏆 碧楓村得救了（金色大字 + glow）
- stats：4 行「標籤 + 值」 grid
- thank line
- 兩個 MenuButton：繼續探索 / 回標題

## 5. CSS

z-index 350（高於 lock 200 / levelup 300）。暗紫底 + 金邊 + glow。fade-in + zoom 動畫，無 fade-out（等玩家按鈕）。

## 6. Mount 位置

Overworld.tsx 上層，與 EquipModal / ItemsModal / DialogModal 並列。

## 7. 邊界案例

- 領獎 → ESC：overlay 蓋過 ESC、z=350 安全
- reload 中：pendingGameComplete 不入 save、completion-shown 防重複
- 多分頁 lock：overlay 蓋過 lock、但 lock 出現時遊戲已 freeze
- 未接 quest 直接打 boss + 領獎：completion-shown 仍 false，overlay 觸發

## 8. 模組架構

| 檔案 | 變動 |
|---|---|
| `core/store.ts` | pendingGameComplete state + clearGameComplete action + claim-reward 邏輯 set pending |
| `ui/GameCompleteOverlay.tsx` | **新檔** |
| `scenes/Overworld.tsx` | mount overlay |
| `index.css` | `.game-complete-*` |

不動：types / save / Battle / Title / GameOver / systems / data

## 9. 約束

- transient state 不入 save
- z-index 350 最高層
- 不阻擋既有 quest 邏輯
- ~45 min + 15 min 驗證

## 10. 風險

- flag 命名避衝突 ✅
- 狀態漂移—overlay 顯示時玩家不能戰鬥（dialog 關閉後出現）
- z-index 350 安全
- new game+ 未來需 reset 邏輯
