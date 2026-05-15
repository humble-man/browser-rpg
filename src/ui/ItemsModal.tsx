import { useGame } from '../core/store';
import { MenuButton } from './MenuButton';
import { getItem } from '../systems/inventory';

interface Props {
  onClose: () => void;
}

const EFFECT_ICON: Record<string, string> = {
  heal: '💊',
  restoreMp: '💧',
  cure: '🧪',
};

export function ItemsModal({ onClose }: Props) {
  const player = useGame(s => s.player);
  const useItem = useGame(s => s.useItem);

  const consumables = player.inventory.filter(({ itemId }) => {
    const it = getItem(itemId);
    return it && it.type === 'consumable';
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card items-modal" onClick={e => e.stopPropagation()}>
        <h2>🧪 道具</h2>
        <div className="items-list">
          {consumables.length === 0 && (
            <div className="empty-inv">無可用道具</div>
          )}
          {consumables.map(({ itemId, count }) => {
            const it = getItem(itemId);
            if (!it) return null;
            const icon = EFFECT_ICON[it.effect?.type ?? ''] ?? '🧪';
            return (
              <div className="shop-row" key={itemId}>
                <div className="shop-row-info">
                  <strong>{icon} {it.name} × {count}</strong>
                  <span className="shop-row-desc">{it.description}</span>
                </div>
                <MenuButton onClick={() => useItem(itemId)} disabled={count <= 0}>
                  使用
                </MenuButton>
              </div>
            );
          })}
        </div>
        <MenuButton fullWidth variant="danger" onClick={onClose}>關閉</MenuButton>
      </div>
    </div>
  );
}
