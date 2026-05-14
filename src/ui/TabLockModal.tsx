import { MenuButton } from './MenuButton';
import type { LockStatus } from '../core/session-lock';

interface Props {
  status: LockStatus;
  onTakeOver: () => void;
  onReturnToTitle: () => void;
}

export function TabLockModal({ status, onTakeOver, onReturnToTitle }: Props) {
  if (status.kind === 'conflict') {
    return (
      <div className="modal-backdrop lock-backdrop">
        <div className="modal-card lock-modal">
          <h3>⚠️ 另一個分頁正在遊玩</h3>
          <p>
            偵測到此瀏覽器內已有另一個分頁正在進行遊戲。
            如果你想在此分頁接續遊玩，請點擊「搶占」，另一分頁將被鎖定。
          </p>
          <MenuButton onClick={onTakeOver} variant="danger" fullWidth>
            ⚡ 搶占（另一分頁將被鎖定）
          </MenuButton>
          <MenuButton onClick={onReturnToTitle} variant="secondary" fullWidth>
            返回標題畫面
          </MenuButton>
        </div>
      </div>
    );
  }

  if (status.kind === 'preempted') {
    return (
      <div className="modal-backdrop lock-backdrop">
        <div className="modal-card lock-modal">
          <h3>🔒 此分頁已被另一分頁接管</h3>
          <p>
            另一個分頁已開始新的遊戲 session。為避免存檔衝突，此分頁已停止操作。
          </p>
          <p className="lock-hint">如需繼續遊玩，請刷新此分頁或關閉。</p>
          <MenuButton
            onClick={() => window.location.reload()}
            fullWidth
            variant="primary"
          >
            🔄 刷新此分頁
          </MenuButton>
        </div>
      </div>
    );
  }

  return null;
}
