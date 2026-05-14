# 分析 Analysis — Multi-tab session lock

## 1. 使用情境

| 場景 | 行為 |
|---|---|
| Tab A 玩遊戲 → 開 Tab B（同 URL）| Tab B 顯示「另一分頁正在遊玩」+「搶佔 / 取消」二選一 |
| Tab B 選「搶佔」 | Tab B 接手，Tab A 收到 storage event → 鎖死 + 提示「已被接管」 |
| Tab B 選「取消」 | Tab B 回標題（不啟動遊戲），Tab A 不受影響 |
| Tab A 關閉 → Tab B 重開 | beforeunload 釋放 lock；Tab B 看不到舊 lock，直接接手 |
| Tab A 瀏覽器當機（lock 殘留）| 心跳停止；Tab B 過 15s 後判定 stale，自動接手 |
| Tab A 重新整理 | 同 tab，beforeunload + 重新 acquire |
| 隱身模式 / 不同 origin | LocalStorage 隔離，互不影響 |

## 2. 狀態機

```
[App mount, active=true]
  read sessionLock
  if exists AND (now - heartbeat) < 15s AND tabId !== mine:
    show conflict modal: "搶佔 / 取消"
  else:
    acquire lock (write new sessionLock with my tabId + now)
    start heartbeat (every 5s update timestamp)

[storage event listener]
  if event.key === sessionLock AND new value.tabId !== mine:
    I've been preempted → stop heartbeat, show preemption modal

[beforeunload]
  if I own lock → remove it

[active flips false]
  release lock (back to title)
```

## 3. 邊界案例

- **競態 race**：兩分頁同時 mount，都讀到「無 lock」，都寫入 → 後寫的覆蓋。**接受**（罕見且結果是後者贏）。
- **心跳節流**：背景分頁的 setTimeout 可能被 throttle 到 1Hz+。15s threshold 足以容忍。
- **localStorage 寫入失敗**：quota exceeded / 隱身模式限制 → try/catch，失敗時降級為「不啟用 lock」。
- **快速 reload**：beforeunload 釋放 → reload 完成 → 重新 acquire。短暫無 lock 視窗（< 100ms）可接受。
- **同 tab 但不同 session**（瀏覽器標籤頁恢復）：tabId 重新生成 → 視為新 tab 行為。
- **時鐘倒流**（系統時間調整）：`now - heartbeat` 可能變負 → 用 `Math.abs` 雙保險。

## 4. UI 影響

新元件 `<TabLockModal>` 顯示在最上層（z-index 高於 shop modal）：
- **conflict**：「⚠️ 另一個分頁正在遊玩」→ 兩個按鈕：搶佔 / 取消
- **preempted**：「⚠️ 此分頁已被另一分頁接管」→ 一個按鈕：刷新分頁

對既有 scenes（Title/Overworld/Battle/Shop/GameOver）**完全不動**，只在 App.tsx 頂層 mount lock manager。

## 5. 模組架構

| 檔案 | 用途 |
|---|---|
| `src/core/session-lock.ts` | **新**：lock 取得 / 釋放 / 心跳 / 偵聽，匯出 hook `useTabLock(active)` |
| `src/ui/TabLockModal.tsx` | **新**：兩種狀態的 modal UI |
| `src/App.tsx` | 加 `<TabLockModal>` 為頂層 sibling |
| `src/index.css` | 加 `.lock-modal` 樣式 |
| 其他檔案 | 完全不動 |

## 6. 約束

- **儲存空間**：lock 物件約 50 bytes，志忽不計
- **心跳頻率**：5s（balance：太頻繁浪費 CPU；太慢拉長 stale 判定時間）
- **stale threshold**：15s（= 3 次心跳缺席）
- **不阻擋遊玩流程**：lock acquire 失敗時降級為警告，遊戲仍可玩
- **生命週期**：lock 心跳在「scene !== 'title'」期間運作；在 title 時不持有 lock
- **時間預算**：1–2 小時實作 + 0.5 小時驗證

## 7. 風險

- **beforeunload 不保證執行**：瀏覽器當機 / 強制關閉 → lock 殘留。**緩解**：15s stale threshold 自動回收。
- **storage event 不在自身 tab 觸發**：只有「其他」tab 看得到。**確認**：這是預期行為。
- **多分頁 testing**：手動測試需開兩個瀏覽器分頁，無法只用 Claude Preview（單 tab）。**緩解**：用 eval 模擬 storage event + 設置 stale lock 來驗證所有分支。
- **React StrictMode 雙重 mount**：useEffect 會 mount/unmount/mount → tabId 重新生成 → 自己跟自己搶 lock。**緩解**：useRef 持久化 tabId，並識別 self。
