import { useEffect, useState } from 'react';
import { useGame, SKILLS } from '../core/store';
import { HpBar } from '../ui/HpBar';
import { MenuButton } from '../ui/MenuButton';
import { getItem } from '../systems/inventory';

type Menu = 'main' | 'skill' | 'item';

export function Battle() {
  const player = useGame(s => s.player);
  const battle = useGame(s => s.battle);
  const playerAct = useGame(s => s.playerAct);
  const advanceTurn = useGame(s => s.advanceTurn);
  const enemyAct = useGame(s => s.enemyAct);
  const closeBattle = useGame(s => s.closeBattle);
  const [menu, setMenu] = useState<Menu>('main');
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);

  // Drive phase transitions: animating -> advanceTurn, enemy -> enemyAct.
  useEffect(() => {
    if (!battle) return;

    if (battle.phase === 'animating') {
      if (battle.lastDamage?.target === 'enemy') {
        setShakeEnemy(true);
        setTimeout(() => setShakeEnemy(false), 400);
      } else if (battle.lastDamage?.target === 'player') {
        setShakePlayer(true);
        setTimeout(() => setShakePlayer(false), 400);
      }
      const t = setTimeout(() => advanceTurn(), 700);
      return () => clearTimeout(t);
    }

    if (battle.phase === 'enemy') {
      const t = setTimeout(() => enemyAct(), 600);
      return () => clearTimeout(t);
    }

    if (battle.phase === 'player') {
      setMenu('main');
    }
  }, [battle?.phase, advanceTurn, enemyAct, battle]);

  if (!battle) return null;

  const { enemy, enemyCurrentHp, phase, log, isBoss } = battle;
  const isOver = phase === 'won' || phase === 'lost' || phase === 'fled';

  return (
    <div className={`battle-scene${isBoss ? ' battle-boss' : ''}`}>
      <div className="battle-stage">
        {/* Enemy */}
        <div className={`combatant combatant-enemy${shakeEnemy ? ' shake' : ''}`}>
          <div className="combatant-portrait">{enemy.emoji}</div>
          <div className="combatant-name">{enemy.name}</div>
          <HpBar current={enemyCurrentHp} max={enemy.maxHp} variant="hp" />
          {battle.lastDamage?.target === 'enemy' && shakeEnemy && (
            <div className={`damage-pop${battle.lastDamage.crit ? ' crit' : ''}`}>
              -{battle.lastDamage.amount}
            </div>
          )}
        </div>

        {/* Player */}
        <div className={`combatant combatant-player${shakePlayer ? ' shake' : ''}${player.defending ? ' defending' : ''}`}>
          <div className="combatant-portrait">🧙</div>
          <div className="combatant-name">{player.name} Lv.{player.level}</div>
          <HpBar label="HP" current={player.hp} max={player.maxHp} variant="hp" />
          <HpBar label="MP" current={player.mp} max={player.maxMp} variant="mp" />
          {battle.lastDamage?.target === 'player' && shakePlayer && (
            <div className={`damage-pop${battle.lastDamage.crit ? ' crit' : ''}`}>
              -{battle.lastDamage.amount}
            </div>
          )}
        </div>
      </div>

      <div className="battle-log">
        {log.map((l, i) => (
          <div key={i} className="log-line" style={{ opacity: 0.3 + (0.7 * (i + 1)) / log.length }}>
            {l}
          </div>
        ))}
      </div>

      <div className="battle-menu">
        {isOver ? (
          <div className="battle-result">
            <div className="result-text">
              {phase === 'won' && '🎊 戰鬥勝利！'}
              {phase === 'lost' && '☠️ 戰敗⋯'}
              {phase === 'fled' && '💨 成功逃離！'}
            </div>
            <MenuButton fullWidth onClick={closeBattle}>
              {phase === 'lost' ? '前往 Game Over' : '繼續冒險'}
            </MenuButton>
          </div>
        ) : phase !== 'player' ? (
          <div className="battle-wait">敵方行動中⋯</div>
        ) : menu === 'main' ? (
          <div className="action-grid">
            <MenuButton onClick={() => playerAct('attack')}>🗡️ 攻擊</MenuButton>
            <MenuButton onClick={() => setMenu('skill')} variant="secondary">✨ 魔法</MenuButton>
            <MenuButton onClick={() => setMenu('item')} variant="secondary">🧪 道具</MenuButton>
            <MenuButton onClick={() => playerAct('defend')} variant="secondary">🛡️ 防禦</MenuButton>
            <MenuButton onClick={() => playerAct('flee')} variant="danger" fullWidth>🏃 逃跑</MenuButton>
          </div>
        ) : menu === 'skill' ? (
          <div className="action-grid action-grid-list">
            {player.skills.filter(id => id !== 'attack').map(id => {
              const sk = SKILLS[id];
              if (!sk) return null;
              const cannot = player.mp < sk.mpCost;
              return (
                <MenuButton
                  key={id}
                  onClick={() => playerAct('skill', id)}
                  disabled={cannot}
                  fullWidth
                  variant="secondary"
                >
                  ✦ {sk.name} (MP {sk.mpCost})
                  <span className="action-desc"> — {sk.description}</span>
                </MenuButton>
              );
            })}
            <MenuButton fullWidth variant="danger" onClick={() => setMenu('main')}>← 返回</MenuButton>
          </div>
        ) : (
          <div className="action-grid action-grid-list">
            {player.inventory.length === 0 && (
              <div className="empty-inv">道具袋是空的</div>
            )}
            {player.inventory.map(({ itemId, count }) => {
              const it = getItem(itemId);
              if (!it || it.type !== 'consumable') return null;
              return (
                <MenuButton
                  key={itemId}
                  onClick={() => playerAct('item', itemId)}
                  fullWidth
                  variant="secondary"
                >
                  🧪 {it.name} × {count}
                  <span className="action-desc"> — {it.description}</span>
                </MenuButton>
              );
            })}
            <MenuButton fullWidth variant="danger" onClick={() => setMenu('main')}>← 返回</MenuButton>
          </div>
        )}
      </div>
    </div>
  );
}
