import { useState } from 'react';
import { useGame } from '../core/store';
import { MenuButton } from '../ui/MenuButton';
import { ITEMS, countOf, getItem } from '../systems/inventory';

const SHOP_STOCK = ['potion', 'ether', 'antidote', 'iron-sword', 'leather-armor'];

type Tab = 'buy' | 'sell' | 'equip';

export function Shop() {
  const player = useGame(s => s.player);
  const closeShop = useGame(s => s.closeShop);
  const buy = useGame(s => s.buy);
  const sell = useGame(s => s.sell);
  const equipItem = useGame(s => s.equipItem);
  const [tab, setTab] = useState<Tab>('buy');

  return (
    <div className="modal-backdrop" onClick={closeShop}>
      <div className="modal-card shop-card" onClick={e => e.stopPropagation()}>
        <div className="shop-header">
          <h2>🛒 雜貨商店</h2>
          <div className="shop-gold">💰 {player.gold} G</div>
        </div>

        <div className="shop-tabs">
          <button className={`tab${tab === 'buy' ? ' active' : ''}`} onClick={() => setTab('buy')}>購買</button>
          <button className={`tab${tab === 'sell' ? ' active' : ''}`} onClick={() => setTab('sell')}>賣出</button>
          <button className={`tab${tab === 'equip' ? ' active' : ''}`} onClick={() => setTab('equip')}>裝備</button>
        </div>

        <div className="shop-list">
          {tab === 'buy' && SHOP_STOCK.map(id => {
            const it = ITEMS[id];
            if (!it) return null;
            return (
              <div className="shop-row" key={id}>
                <div className="shop-row-info">
                  <strong>{it.name}</strong>
                  <span className="shop-row-desc">{it.description}</span>
                </div>
                <div className="shop-row-actions">
                  <span className="shop-row-price">{it.price}G</span>
                  <MenuButton onClick={() => buy(id)} disabled={player.gold < it.price}>
                    買入
                  </MenuButton>
                </div>
              </div>
            );
          })}

          {tab === 'sell' && player.inventory.length === 0 && (
            <div className="empty-inv">沒有可賣的道具</div>
          )}
          {tab === 'sell' && player.inventory.map(({ itemId, count }) => {
            const it = getItem(itemId);
            if (!it) return null;
            return (
              <div className="shop-row" key={itemId}>
                <div className="shop-row-info">
                  <strong>{it.name} × {count}</strong>
                  <span className="shop-row-desc">{it.description}</span>
                </div>
                <div className="shop-row-actions">
                  <span className="shop-row-price">{Math.floor(it.price / 2)}G</span>
                  <MenuButton onClick={() => sell(itemId)}>賣出</MenuButton>
                </div>
              </div>
            );
          })}

          {tab === 'equip' && player.inventory.filter(i => {
            const it = getItem(i.itemId);
            return it && (it.type === 'weapon' || it.type === 'armor');
          }).length === 0 && (
            <div className="empty-inv">沒有可裝備的道具</div>
          )}
          {tab === 'equip' && player.inventory.map(({ itemId, count }) => {
            const it = getItem(itemId);
            if (!it || (it.type !== 'weapon' && it.type !== 'armor')) return null;
            const slot = it.type;
            const equipped = player.equipment[slot] === itemId;
            return (
              <div className="shop-row" key={itemId}>
                <div className="shop-row-info">
                  <strong>{it.name} × {count}</strong>
                  <span className="shop-row-desc">{it.description}（{it.type === 'weapon' ? '武器' : '防具'}）</span>
                </div>
                <div className="shop-row-actions">
                  <MenuButton
                    onClick={() => { if (!equipped) equipItem(itemId); }}
                    disabled={equipped || countOf(player, itemId) === 0}
                  >
                    {equipped ? '已裝備' : '裝備'}
                  </MenuButton>
                </div>
              </div>
            );
          })}
        </div>

        <div className="shop-footer">
          <MenuButton fullWidth variant="danger" onClick={closeShop}>離開商店</MenuButton>
        </div>
      </div>
    </div>
  );
}
