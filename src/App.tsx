import { useGame } from './core/store';
import { Title } from './scenes/Title';
import { Overworld } from './scenes/Overworld';
import { Battle } from './scenes/Battle';
import { GameOver } from './scenes/GameOver';

export function App() {
  const scene = useGame(s => s.scene);

  return (
    <div className="app-shell">
      {scene === 'title' && <Title />}
      {scene === 'overworld' && <Overworld />}
      {scene === 'battle' && <Battle />}
      {scene === 'gameover' && <GameOver />}
      <footer className="app-footer">
        <span>browser-rpg v0.1 · 鍵盤 WASD / 方向鍵移動 · ESC 開選單</span>
      </footer>
    </div>
  );
}
