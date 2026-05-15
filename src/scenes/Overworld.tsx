import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../core/store';
import { MAPS } from '../data/maps';
import { MenuButton } from '../ui/MenuButton';
import { HpBar } from '../ui/HpBar';
import { EquipModal } from '../ui/EquipModal';
import { ItemsModal } from '../ui/ItemsModal';
import { DialogModal } from '../ui/DialogModal';
import { Shop } from './Shop';
import { xpForNextLevel } from '../core/store';

const TILE_GLYPH: Record<string, string> = {
  grass: '·',
  floor: '·',
  wall: '',
  shop: '🛒',
  inn: '🛏️',
  'dungeon-entry': '🗝️',
  'village-exit': '🚪',
  boss: '🐉',
  sign: '📜',
  treasure: '📦',
  npc: '👤',
  'mini-boss': '⚔️',
};

export function Overworld() {
  const player = useGame(s => s.player);
  const flags = useGame(s => s.flags);
  const movePlayer = useGame(s => s.movePlayer);
  const messages = useGame(s => s.messages);
  const shopOpen = useGame(s => s.shopOpen);
  const activeDialog = useGame(s => s.activeDialog);
  const saveGame = useGame(s => s.saveGame);
  const resetToTitle = useGame(s => s.resetToTitle);
  const exportSave = useGame(s => s.exportSave);
  const [showMenu, setShowMenu] = useState(false);
  const [showEquip, setShowEquip] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const map = MAPS[player.position.mapId];
  const xpNext = useMemo(() => xpForNextLevel(player.level), [player.level]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (shopOpen) return;
      if (showMenu) return;
      if (showEquip) return;
      if (showItems) return;
      if (activeDialog) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') { movePlayer(0, -1); e.preventDefault(); }
      else if (k === 'arrowdown' || k === 's') { movePlayer(0, 1); e.preventDefault(); }
      else if (k === 'arrowleft' || k === 'a') { movePlayer(-1, 0); e.preventDefault(); }
      else if (k === 'arrowright' || k === 'd') { movePlayer(1, 0); e.preventDefault(); }
      else if (k === 'escape') { setShowMenu(true); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [movePlayer, shopOpen, showMenu, showEquip, showItems, activeDialog]);

  return (
    <div className="overworld-scene">
      <div className="overworld-header">
        <div className="map-title">
          <span className="map-name">{map.name}</span>
          <span className="map-pos">({player.position.x}, {player.position.y})</span>
        </div>
        <div className="player-status">
          <span className="player-name">⚔️ {player.name} Lv.{player.level}</span>
          <span className="player-gold">💰 {player.gold}G</span>
        </div>
      </div>

      <div className="overworld-body">
        <div
          className="map-grid"
          style={{
            gridTemplateColumns: `repeat(${map.width}, 1fr)`,
            gridTemplateRows: `repeat(${map.height}, 1fr)`,
          }}
        >
          {map.tiles.flatMap((row, y) =>
            row.map((tile, x) => {
              const isPlayer = player.position.x === x && player.position.y === y;
              let glyph: string = TILE_GLYPH[tile.type] ?? '';
              if (tile.type === 'treasure') {
                const opened = flags[`treasure-${player.position.mapId}-${x}-${y}`];
                glyph = opened ? '📭' : '📦';
              }
              if (tile.type === 'npc') {
                const npc = map.npcs?.[`${x},${y}`];
                glyph = npc?.emoji ?? '👤';
              }
              if (tile.type === 'mini-boss') {
                glyph = flags['mini-boss-defeated'] ? '🗡️' : '⚔️';
              }
              return (
                <div
                  key={`${x}-${y}`}
                  className={`tile tile-${tile.type}${isPlayer ? ' tile-player' : ''}`}
                >
                  {isPlayer ? '🧙' : glyph}
                </div>
              );
            }),
          )}
        </div>

        <aside className="overworld-side">
          <div className="status-panel">
            <HpBar label="HP" current={player.hp} max={player.maxHp} variant="hp" />
            <HpBar label="MP" current={player.mp} max={player.maxMp} variant="mp" />
            <HpBar
              label={`XP → Lv.${player.level + 1}`}
              current={Math.min(player.xp, xpNext)}
              max={xpNext}
              variant="xp"
            />
            <div className="stat-grid">
              <div><span>ATK</span><strong>{player.atk}</strong></div>
              <div><span>DEF</span><strong>{player.def}</strong></div>
              <div><span>SPD</span><strong>{player.spd}</strong></div>
            </div>
            <div className="equip-line">
              <span>武器</span>
              <strong>{player.equipment.weapon ? '🗡️ 已裝備' : '—'}</strong>
            </div>
            <div className="equip-line">
              <span>防具</span>
              <strong>{player.equipment.armor ? '🛡️ 已裝備' : '—'}</strong>
            </div>
          </div>

          <div className="message-log">
            {messages.length === 0 && <div className="message-empty">⋯</div>}
            {messages.map((m, i) => <div key={i} className="message-line">{m}</div>)}
          </div>

          <div className="mobile-controls">
            <div></div>
            <button className="dpad" onClick={() => movePlayer(0, -1)} aria-label="up">▲</button>
            <div></div>
            <button className="dpad" onClick={() => movePlayer(-1, 0)} aria-label="left">◀</button>
            <button className="dpad" onClick={() => setShowMenu(true)} aria-label="menu">≡</button>
            <button className="dpad" onClick={() => movePlayer(1, 0)} aria-label="right">▶</button>
            <div></div>
            <button className="dpad" onClick={() => movePlayer(0, 1)} aria-label="down">▼</button>
            <div></div>
          </div>
        </aside>
      </div>

      {shopOpen && <Shop />}

      {showEquip && <EquipModal onClose={() => setShowEquip(false)} />}
      {showItems && <ItemsModal onClose={() => setShowItems(false)} />}
      <DialogModal />

      {showMenu && (
        <div className="modal-backdrop" onClick={() => setShowMenu(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>系統選單</h3>
            <MenuButton fullWidth onClick={() => { setShowMenu(false); setShowEquip(true); }}>🎒 裝備</MenuButton>
            <MenuButton fullWidth onClick={() => { setShowMenu(false); setShowItems(true); }}>🧪 道具</MenuButton>
            <MenuButton fullWidth onClick={() => { saveGame(); setShowMenu(false); }}>💾 存檔</MenuButton>
            <MenuButton fullWidth variant="secondary" onClick={() => {
              const json = exportSave();
              navigator.clipboard?.writeText(json).then(() => {
                alert('存檔 JSON 已複製到剪貼簿');
              }).catch(() => {
                prompt('複製這段 JSON 作為存檔備份:', json);
              });
              setShowMenu(false);
            }}>📤 匯出存檔 (複製到剪貼簿)</MenuButton>
            <MenuButton fullWidth variant="secondary" onClick={() => setShowMenu(false)}>關閉</MenuButton>
            <MenuButton fullWidth variant="danger" onClick={() => {
              if (confirm('回到標題畫面？未存檔的進度會遺失。')) {
                resetToTitle();
              }
            }}>↩ 回到標題</MenuButton>
          </div>
        </div>
      )}
    </div>
  );
}
