# 提案 Intent — Multi-tab session lock

## 這是什麼

避免「玩家同時開兩個分頁玩同一個存檔」造成存檔互相覆蓋。
進入遊戲時在 LocalStorage 寫入 sessionLock（含 tabId + 心跳時間戳），
其他分頁進來偵測到活躍 lock 即提示「另一個分頁正在遊玩，是否搶佔？」。

## 為誰而做

- **意外開兩個分頁的玩家**：例如不小心 Ctrl+Click 連結、或從不同入口進來
- **想多開「測試」分頁的玩家**：例如想試不同的戰術而不影響主存檔
- **未來分享 URL 的場景**（cycle 7 立繪 / 8 PWA 之後）：用戶把 URL bookmark 兩處導致雙開
- **作者**：練習 LocalStorage 事件監聽 + 心跳 + 跨 tab 通訊

## 解決什麼問題

`docs/analysis.md` §3 (cycle 1) 明列「多分頁同步：兩個分頁互相覆蓋存檔」為高風險邊界案例，
但 MVP / cycle 1-3 都沒實作。Cycle 4 補上這層 — 把「無聲資料毀損」變成「明確提示」。

## 範圈

- ✅ 偵測同 origin 下其他分頁是否正在遊玩
- ✅ 提示玩家「搶佔 / 取消」二選一
- ✅ 主動分頁定期更新心跳；過期自動釋放
- ✅ 關閉分頁時釋放 lock（best-effort，beforeunload）
- ❌ 不做「分頁間同步狀態」（複雜度爆炸）
- ❌ 不做「自動 reload 為被搶佔的分頁」（保留現狀，用戶手動處理）
- ❌ 不做 BroadcastChannel API（用 storage event 已夠）
- ❌ 不改存檔結構
