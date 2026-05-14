import { useState } from 'react';
import { useGame } from '../core/store';
import { MenuButton } from '../ui/MenuButton';
import { clearSave } from '../core/save';

export function Title() {
  const [name, setName] = useState('勇者');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const newGame = useGame(s => s.newGame);
  const loadGame = useGame(s => s.loadGame);
  const hasSave = useGame(s => s.hasSave);
  const refreshHasSave = useGame(s => s.refreshHasSave);
  const importSave = useGame(s => s.importSave);

  return (
    <div className="title-scene">
      <div className="title-card">
        <h1 className="title-main">
          幽影迷宮
          <span className="title-sub">— Browser RPG</span>
        </h1>
        <p className="title-tagline">
          ✦ 一款打開瀏覽器即玩的回合制冒險 ✦
        </p>

        <div className="title-section">
          <label className="title-label">
            主角姓名
            <input
              className="title-input"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 8))}
              maxLength={8}
              placeholder="勇者"
            />
          </label>
        </div>

        <div className="title-buttons">
          <MenuButton onClick={() => newGame(name)} fullWidth variant="primary">
            🗡️ 開始新遊戲
          </MenuButton>
          <MenuButton
            onClick={() => {
              const ok = loadGame();
              if (!ok) alert('沒有可用的存檔');
            }}
            disabled={!hasSave}
            fullWidth
            variant="secondary"
          >
            📂 載入存檔
          </MenuButton>
          <MenuButton onClick={() => setShowImport(s => !s)} fullWidth variant="secondary">
            📥 匯入存檔 (JSON)
          </MenuButton>
          {hasSave && (
            <MenuButton
              onClick={() => {
                if (confirm('真的要刪除存檔嗎？')) {
                  clearSave();
                  refreshHasSave();
                }
              }}
              fullWidth
              variant="danger"
            >
              🗑️ 刪除存檔
            </MenuButton>
          )}
        </div>

        {showImport && (
          <div className="title-import">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="貼上之前匯出的 JSON 存檔..."
              rows={6}
              className="title-textarea"
            />
            <MenuButton
              onClick={() => {
                const ok = importSave(importText);
                if (!ok) alert('JSON 格式錯誤');
              }}
              fullWidth
            >
              確認匯入
            </MenuButton>
          </div>
        )}

        <p className="title-controls">
          🎮 鍵盤：方向鍵 / WASD 移動 · 滑鼠：點擊按鈕
        </p>
      </div>
    </div>
  );
}
