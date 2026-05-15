import { useEffect } from 'react';
import { useGame } from '../core/store';
import { MenuButton } from './MenuButton';

export function DialogModal() {
  const activeDialog = useGame(s => s.activeDialog);
  const advance = useGame(s => s.advanceDialog);

  useEffect(() => {
    if (!activeDialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDialog, advance]);

  if (!activeDialog) return null;
  const { npc, lineIndex } = activeDialog;
  const line = npc.lines[lineIndex];
  if (!line) return null;
  const isLast = lineIndex === npc.lines.length - 1;

  return (
    <div className="modal-backdrop dialog-backdrop">
      <div className="modal-card dialog-modal">
        <div className="dialog-speaker">
          <span className="dialog-emoji">{npc.emoji}</span>
          <span className="dialog-name">{line.speaker}</span>
        </div>
        <div className="dialog-text">{line.text}</div>
        <MenuButton fullWidth onClick={advance}>
          {isLast ? '關閉' : '▶ 下一句'}
        </MenuButton>
        <div className="dialog-hint">Enter / Space 推進</div>
      </div>
    </div>
  );
}
