# 設計 Design — Multi-tab session lock

## 1. 核心模組 `src/core/session-lock.ts`

```typescript
const LOCK_KEY = 'browser-rpg.sessionLock';
const HEARTBEAT_MS = 5000;
const STALE_MS = 15000;

interface LockData {
  tabId: string;
  timestamp: number;
}

export type LockStatus =
  | { kind: 'idle' }        // 還沒 acquire（title 時 / 初始）
  | { kind: 'owned' }       // 我擁有 lock
  | { kind: 'conflict' }    // 偵測到別人有活躍 lock
  | { kind: 'preempted' };  // 我被搶佔了
```

純函式部分：readLock / writeLock / clearLock / isStale。全部含 try/catch 容錯。

## 2. React Hook `useTabLock(active: boolean)`

- `tabId` 透過 `useRef` 持久化（React StrictMode safe）
- `active` 切換時觸發 acquire 或 release
- storage event 只在 active 期間掛載
- beforeunload 只清屬於自己的 lock

回傳：`{ status: LockStatus; takeOver: () => void }`

## 3. 新元件 `src/ui/TabLockModal.tsx`

兩種狀態的 modal：
- **conflict**：「⚠️ 另一分頁正在遊玩」+ 「搶佔 / 取消」二選一
- **preempted**：「此分頁已被接管」+ 「刷新」一個按鈕

## 4. `App.tsx` 整合

```tsx
const scene = useGame(s => s.scene);
const resetToTitle = useGame(s => s.resetToTitle);
const { status, takeOver } = useTabLock(scene !== 'title');

return (
  <div className="app-shell">
    {/* scenes */}
    <TabLockModal status={status} onTakeOver={takeOver} onReturnToTitle={resetToTitle} />
    <footer>...</footer>
  </div>
);
```

`active = scene !== 'title'` — 在 title 時不持有 lock，多個 title 分頁可並存。

## 5. CSS

`.lock-backdrop` z-index 200（高於 shop modal 100）。

## 6. 不動的部分

| 模組 | 為何不動 |
|---|---|
| 所有 scenes | UI 不變，由 App.tsx 頂層 mount modal |
| `core/store.ts` | 不引入 lock 狀態，hook 內部處理 |
| `core/save.ts` | 存檔結構不變 |
| 所有 systems | 與 lock 無關 |
| 所有 data JSON | 不需修改 |

## 7. 驗證計畫

| Case | 驗證方法 |
|---|---|
| 玩家正常進入（無衝突）| 啟動 → 點新遊戲 → 檢查 localStorage中 sessionLock 存在且 tabId 為當前 |
| 偵測到別人活躍 lock | eval：手動寫入 `{ tabId: 'OTHER', timestamp: Date.now() }`，reload 後點新遊戲應顯示 conflict modal |
| Stale lock 自動接手 | eval：手動寫入 `{ tabId: 'OLD', timestamp: Date.now() - 20000 }`，reload 後點新遊戲應正常進入 |
| 被搶佔（preempted）| 進入遊戲後 eval：手動寫入 `{ tabId: 'NEWER', timestamp: Date.now() }` + dispatch storage event，應顯示 preempted modal |
| 心跳更新 timestamp | 進入遊戲 → 等 6s → 檢查 timestamp 變新 |
| 回 title 釋放 lock | ESC 選單 → 返回標題 → 檢查 lock 不存在 |
| Console error/warning | 0 |

### 回歸測試

Cycle 1 / 2 / 3 功能仍正常。

## 8. 風險

- **StrictMode 雙 mount**：useRef 持久化解決
- **storage event 不在自身 tab 觸發**：預期行為
- **時鐘倒流**：Math.abs 雙保險
- **實機跨 tab 驗證**：需用戶手動開兩個分頁試
- **z-index 衝突**：明確指定 200
