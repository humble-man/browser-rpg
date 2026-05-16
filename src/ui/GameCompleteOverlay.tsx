import { useGame } from '../core/store';
import { MenuButton } from './MenuButton';

export function GameCompleteOverlay() {
  const pending = useGame(s => s.pendingGameComplete);
  const player = useGame(s => s.player);
  const flags = useGame(s => s.flags);
  const bossDefeated = useGame(s => s.bossDefeated);
  const clearGameComplete = useGame(s => s.clearGameComplete);
  const resetToTitle = useGame(s => s.resetToTitle);

  if (!pending) return null;

  return (
    <div className="modal-backdrop game-complete-backdrop">
      <div className="modal-card game-complete-panel" onClick={e => e.stopPropagation()}>
        <h2 className="gc-banner">🏆 碧楓村得救了</h2>
        <div className="gc-stats">
          <div className="gc-stat-row">
            <span>最終等級</span>
            <strong>Lv. {player.level}</strong>
          </div>
          <div className="gc-stat-row">
            <span>持有金幣</span>
            <strong>💰 {player.gold} G</strong>
          </div>
          <div className="gc-stat-row">
            <span>擊敗迷霧獵手</span>
            <strong>{flags['mini-boss-defeated'] ? '⚔️ ✓' : '— 未挑戰'}</strong>
          </div>
          <div className="gc-stat-row">
            <span>擊敗幽魂龍</span>
            <strong>{bossDefeated ? '🐉 ✓' : '— 未擊敗'}</strong>
          </div>
        </div>
        <div className="gc-thank">謝謝你完成這個冒險。</div>
        <MenuButton fullWidth variant="primary" onClick={clearGameComplete}>
          ⚔️ 繼續探索
        </MenuButton>
        <MenuButton
          fullWidth
          variant="secondary"
          onClick={() => {
            clearGameComplete();
            resetToTitle();
          }}
        >
          ↩ 回標題
        </MenuButton>
      </div>
    </div>
  );
}
