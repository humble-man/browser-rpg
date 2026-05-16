import { useState } from 'react';
import { useGame } from '../core/store';
import { MenuButton } from '../ui/MenuButton';
import { clearSave } from '../core/save';
import { isMuted, setMuted, playSE } from '../core/audio';

export function Title() {
  const [name, setName] = useState('勇者');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [mutedState, setMutedState] = useState(isMuted());
  const newGame = useGame(s => s.newGame);
  const loadGame = useGame(s => s.loadGame);
  const hasSave = useGame(s => s.hasSave);
  const refreshHasSave = useGame(s => s.refreshHasSave);
  const importSave = useGame(s => s.importSave);

  const toggleMute = () => {
    const next = !mutedState;
    setMuted(next);
    setMutedState(next);
    if (!next) playSE('menu');
  };

  return (
    <div className="title-scene">
      <div className="title-card">
        <div className="title-banner">
          <span className="title-banner-deco">⚔️</span>
          <h1 className="title-main">幽影迷宮</h1>
          <span className="title-banner-deco">⚔️</span>
        </div>
        <p className="title-subtitle">─ 碧楓村的傳說 ─</p>

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

        <div className="title-audio-toggle">
          <MenuButton
            fullWidth
            variant={mutedState ? 'secondary' : 'primary'}
            onClick={toggleMute}
          >
            {mutedState ? '🔇 已靜音（點擊開聲）' : '🔊 聲音開啟（點擊靜音）'}
          </MenuButton>
        </div>

        <footer className="title-footer">
          <span>v{__APP_VERSION__}</span>
          <span className="title-footer-sep"> · </span>
          <a
            href="https://github.com/humble-man/browser-rpg"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
