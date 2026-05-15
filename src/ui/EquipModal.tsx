import { useGame } from '../core/store';
import { MenuButton } from './MenuButton';
import { getItem } from '../systems/inventory';

interface Props {
  onClose: () => void;
}

function bonusText(bonus?: Record<string, number | undefined>): string {
  if (!bonus) return '';
  return Object.entries(bonus)
    .filter(([, v]) => v != null && v !== 0)
    .map(([k, v]) => `${k.toUpperCase()} +${v}`)
    .join(' · ');
}

export function EquipModal({ onClose }: Props) {
  const player = useGame(s => s.player);
  const equipItem = useGame(s => s.equipItem);

  const weaponId = player.equipment.weapon;
  const armorId = player.equipment.armor;
  const weaponItem = weaponId ? getItem(weaponId) : null;
  const armorItem = armorId ? getItem(armorId) : null;

  const equippable = player.inventory.filter(({ itemId }) => {
    const it = getItem(itemId);
    return it && (it.type === 'weapon' || it.type === 'armor');
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card equip-modal" onClick={e => e.stopPropagation()}>
        <h2>🎒 裝備</h2>

        <div className="equip-current">
          <div className="equip-slot">
            <span className="equip-slot-label">🗡️ 武器</span>
            <span className="equip-slot-value">
              {weaponItem ? weaponItem.name : '— 未裝備'}
            </span>
            {weaponItem?.bonus && (
              <span className="equip-bonus">{bonusText(weaponItem.bonus)}</span>
            )}
          </div>
          <div className="equip-slot">
            <span className="equip-slot-label">🛡️ 防具</span>
            <span className="equip-slot-value">
              {armorItem ? armorItem.name : '— 未裝備'}
            </span>
            {armorItem?.bonus && (
              <span className="equip-bonus">{bonusText(armorItem.bonus)}</span>
            )}
          </div>
        </div>

        <div className="equip-list-title">持有道具</div>
        <div className="equip-list">
          {equippable.length === 0 && (
            <div className="empty-inv">尚無可裝備的道具</div>
          )}
          {equippable.map(({ itemId, count }) => {
            const it = getItem(itemId);
            if (!it) return null;
            const slot = it.type as 'weapon' | 'armor';
            const equipped = player.equipment[slot] === itemId;
            const icon = it.type === 'weapon' ? '🗡️' : '🛡️';
            return (
              <div className="shop-row" key={itemId}>
                <div className="shop-row-info">
                  <strong>{icon} {it.name} × {count}</strong>
                  <span className="shop-row-desc">{it.description}</span>
                </div>
                <MenuButton
                  onClick={() => { if (!equipped) equipItem(itemId); }}
                  disabled={equipped}
                >
                  {equipped ? '已裝備' : '裝備'}
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
