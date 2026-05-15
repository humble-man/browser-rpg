import { useEffect } from 'react';
import { useGame } from '../core/store';

const AUTO_CLOSE_MS = 2000;

export function LevelUpOverlay() {
  const pending = useGame(s => s.pendingLevelUp);
  const clear = useGame(s => s.clearLevelUp);

  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(clear, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [pending, clear]);

  if (!pending) return null;
  const { from, to, hpGained, mpGained, atkGained, defGained, spdGained } = pending;

  return (
    <div className="levelup-backdrop" onClick={clear}>
      <div className="levelup-panel" onClick={e => e.stopPropagation()}>
        <div className="levelup-banner">⬆️ LEVEL UP!</div>
        <div className="levelup-level">Lv. {from} → Lv. {to}</div>
        <div className="levelup-stats">
          {hpGained > 0 && <div className="levelup-stat">+{hpGained} HP</div>}
          {mpGained > 0 && <div className="levelup-stat">+{mpGained} MP</div>}
          {atkGained > 0 && <div className="levelup-stat">+{atkGained} ATK</div>}
          {defGained > 0 && <div className="levelup-stat">+{defGained} DEF</div>}
          {spdGained > 0 && <div className="levelup-stat">+{spdGained} SPD</div>}
        </div>
        <div className="levelup-hint">點擊或等待自動關閉</div>
      </div>
    </div>
  );
}
