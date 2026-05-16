import { useEffect } from 'react';
import { useGame } from '../core/store';
import { MenuButton } from '../ui/MenuButton';
import { stopBgm } from '../core/audio';

export function GameOver() {
  const player = useGame(s => s.player);
  const loadGame = useGame(s => s.loadGame);
  const resetToTitle = useGame(s => s.resetToTitle);
  const hasSave = useGame(s => s.hasSave);

  useEffect(() => {
    stopBgm();
  }, []);

  return (
    <div className="gameover-scene">
      <div className="gameover-card">
        <h1 className="gameover-title">☠ GAME OVER</h1>
        <p className="gameover-sub">{player.name} 倒下了⋯</p>
        <p className="gameover-stats">
          Lv.{player.level} · 取得金幣 {player.gold}G
        </p>
        <div className="gameover-buttons">
          <MenuButton
            fullWidth
            onClick={() => {
              const ok = loadGame();
              if (!ok) alert('沒有存檔');
            }}
            disabled={!hasSave}
          >
            📂 從上次存檔繼續
          </MenuButton>
          <MenuButton fullWidth variant="secondary" onClick={resetToTitle}>
            ↩ 回到標題畫面
          </MenuButton>
        </div>
      </div>
    </div>
  );
}
