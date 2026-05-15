# 設計 Design — Procedural sound effects

## 1. 新模組 `src/core/audio.ts`

- `SEName` type union: attack / crit / heal / levelup / victory / defeat / menu
- `getCtx()` lazy init + resume、能處理 suspended state
- `isMuted()` / `setMuted(b)` LocalStorage 持久化
- `envelope()` 實用函式、gain ramp
- `tone()` / `sweep()` / `noise()` 三個生成器
- `playSE(name)` switch 分派到各 SE 實作

見 PR diff 實體代碼。

## 2. Store 觸發點

- `playerAct` attack/skill: `playSE(crit ? 'crit' : 'attack')`
- `playerAct` item heal: `playSE('heal')`
- `enemyAct`: `playSE(crit ? 'crit' : 'attack')`
- `useItem` heal: `playSE('heal')`

## 3. LevelUpOverlay

useEffect mount 時 playSE('levelup')。

## 4. Battle.tsx

useEffect on phase: 'won' → playSE('victory')、'lost' → playSE('defeat')。

## 5. Overworld.tsx

- ESC 開時 playSE('menu')
- 系統選單加「🔇 靜音」/「🔊 聲音開啟」toggle
- useState(isMuted()) 鏡像狀態

## 6. DialogModal

只在 choice button 點擊加 playSE('menu')，不加在普通 advance。

## 7. 不動的部分

| 模組 | 為何不動 |
|---|---|
| save.ts | mute 自管 LocalStorage |
| types.ts | 不需新型別 |
| systems / data | 不涉及 |
| 其他 scenes | 不涉及 |
| index.css | 不改 |

## 8. 驗證計畫

11 個 case 見 PR 評論。

### 回歸測試

Cycle 1-13 全功能保留。

## 9. 風險

- autoplay policy — lazy init 處理
- iOS Safari webkitAudioContext fallback
- 音量平衡 — 驗證階段調
- 頻繁觸發 — mute 掩護
