import { useGame } from './core/store';
import { Title } from './scenes/Title';
import { Overworld } from './scenes/Overworld';
import { Battle } from './scenes/Battle';
import { GameOver } from './scenes/GameOver';
import { useTabLock } from './core/session-lock';
import { TabLockModal } from './ui/TabLockModal';

export function App() {
  const scene = useGame(s => s.scene);
  const resetToTitle = useGame(s => s.resetToTitle);
  const { status, takeOver } = useTabLock(scene !== 'title');

  return (
    <div className="app-shell">
      {scene === 'title' && <Title />}
      {scene === 'overworld' && <Overworld />}
      {scene === 'battle' && <Battle />}
      {scene === 'gameover' && <GameOver />}
      <TabLockModal status={status} onTakeOver={takeOver} onReturnToTitle={resetToTitle} />
      <footer className="app-footer">
        <span>browser-rpg v0.4 · 鍵盤 WASD / 方向鍵移動 · ESC 開選單</span>
      </footer>
    </div>
  );
}
