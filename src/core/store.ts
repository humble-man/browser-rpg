import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  BattleState,
  Monster,
  Player,
  SceneId,
  Skill,
} from './types';
import { MAPS, isWalkable } from '../data/maps';
import MONSTERS_RAW from '../data/monsters.json';
import SKILLS_RAW from '../data/skills.json';
import { addItem, applyConsumable, countOf, equip, getItem, removeItem } from '../systems/inventory';
import {
  computeOrder,
  enemyAttackDamage,
  playerAttackDamage,
  tryFlee,
} from '../systems/battle';
import { chooseEnemyAction } from '../systems/enemy-ai';
import { rollEncounter } from '../systems/encounter';
import { applyXp, xpForNextLevel } from '../systems/leveling';
import { loadFromStorage, saveToStorage, SAVE_KEY } from './save';
import { chance } from './rng';

const MONSTERS = MONSTERS_RAW as Record<string, Monster>;
const SKILLS = SKILLS_RAW as Record<string, Skill>;

const MAX_LOG = 5;

function makeStartingPlayer(name: string): Player {
  return {
    name,
    level: 1,
    xp: 0,
    gold: 50,
    hp: 32,
    maxHp: 32,
    mp: 10,
    maxMp: 10,
    atk: 9,
    def: 4,
    spd: 5,
    skills: ['attack', 'fireball', 'heal'],
    inventory: [
      { itemId: 'potion', count: 3 },
      { itemId: 'ether', count: 1 },
    ],
    equipment: { weapon: null, armor: null },
    position: { mapId: 'village', x: MAPS.village.spawn.x, y: MAPS.village.spawn.y },
    defending: false,
  };
}

export interface GameStore {
  scene: SceneId;
  player: Player;
  flags: Record<string, boolean>;
  battle: BattleState | null;
  messages: string[];
  shopOpen: boolean;
  hasSave: boolean;
  bossDefeated: boolean;

  // lifecycle
  newGame: (name: string) => void;
  loadGame: () => boolean;
  refreshHasSave: () => void;
  setScene: (scene: SceneId) => void;
  pushMessage: (msg: string) => void;
  clearMessages: () => void;
  saveGame: () => void;
  exportSave: () => string;
  importSave: (json: string) => boolean;
  resetToTitle: () => void;

  // overworld
  movePlayer: (dx: number, dy: number) => void;
  interactHere: () => void;

  // battle
  startBattle: (monsterId: string, isBoss?: boolean) => void;
  playerAct: (action: 'attack' | 'skill' | 'item' | 'defend' | 'flee', payload?: string) => void;
  advanceTurn: () => void;
  enemyAct: () => void;
  closeBattle: () => void;

  // shop
  openShop: () => void;
  closeShop: () => void;
  buy: (itemId: string) => void;
  sell: (itemId: string) => void;
  equipItem: (itemId: string) => void;

  // inventory (outside battle)
  useItem: (itemId: string) => void;
}

function pushLog(b: BattleState, line: string) {
  b.log.push(line);
  if (b.log.length > MAX_LOG) b.log.shift();
}

export const useGame = create<GameStore>()(
  immer((set, get) => ({
    scene: 'title',
    player: makeStartingPlayer('勇者'),
    flags: {},
    battle: null,
    messages: [],
    shopOpen: false,
    hasSave: !!localStorage.getItem(SAVE_KEY),
    bossDefeated: false,

    refreshHasSave: () => {
      set(s => {
        s.hasSave = !!localStorage.getItem(SAVE_KEY);
      });
    },

    newGame: (name: string) => {
      set(s => {
        s.player = makeStartingPlayer(name || '勇者');
        s.flags = {};
        s.battle = null;
        s.shopOpen = false;
        s.messages = [];
        s.scene = 'overworld';
        s.bossDefeated = false;
      });
    },

    loadGame: () => {
      const raw = loadFromStorage();
      if (!raw) return false;
      // Migration: if the saved position lands on a wall in the current map
      // (map layout may have changed across versions), reset to spawn.
      const map = MAPS[raw.player.position.mapId];
      const tile = map.tiles[raw.player.position.y]?.[raw.player.position.x];
      if (!tile || tile.type === 'wall') {
        raw.player.position.x = map.spawn.x;
        raw.player.position.y = map.spawn.y;
      }
      set(s => {
        s.player = raw.player;
        s.flags = raw.flags ?? {};
        s.bossDefeated = raw.bossDefeated ?? false;
        s.battle = null;
        s.shopOpen = false;
        s.messages = [];
        s.scene = 'overworld';
      });
      return true;
    },

    setScene: (scene) => set(s => { s.scene = scene; }),

    pushMessage: (msg) => set(s => {
      s.messages.push(msg);
      if (s.messages.length > 4) s.messages.shift();
    }),

    clearMessages: () => set(s => { s.messages = []; }),

    saveGame: () => {
      saveToStorage({
        player: get().player,
        flags: get().flags,
        bossDefeated: get().bossDefeated,
      });
      set(s => {
        s.hasSave = true;
        s.messages.push('💾 已存檔');
      });
    },

    exportSave: () => {
      return JSON.stringify({
        player: get().player,
        flags: get().flags,
        bossDefeated: get().bossDefeated,
      }, null, 2);
    },

    importSave: (json: string) => {
      try {
        const parsed = JSON.parse(json);
        if (!parsed.player) return false;
        set(s => {
          s.player = parsed.player;
          s.flags = parsed.flags ?? {};
          s.bossDefeated = parsed.bossDefeated ?? false;
          s.battle = null;
          s.shopOpen = false;
          s.messages = ['📥 存檔已匯入'];
          s.scene = 'overworld';
        });
        saveToStorage({
          player: parsed.player,
          flags: parsed.flags ?? {},
          bossDefeated: parsed.bossDefeated ?? false,
        });
        return true;
      } catch {
        return false;
      }
    },

    resetToTitle: () => set(s => {
      s.scene = 'title';
      s.battle = null;
      s.shopOpen = false;
      s.messages = [];
    }),

    movePlayer: (dx, dy) => {
      const state = get();
      if (state.scene !== 'overworld') return;
      if (state.battle) return;
      const { mapId, x, y } = state.player.position;
      const map = MAPS[mapId];
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) return;
      const tile = map.tiles[ny][nx];
      if (!isWalkable(tile)) return;

      set(s => {
        s.player.position.x = nx;
        s.player.position.y = ny;
      });

      // After moving, handle tile interaction
      const movedTile = MAPS[mapId].tiles[ny][nx];
      if (movedTile.type === 'shop') {
        get().openShop();
        return;
      }
      if (movedTile.type === 'inn') {
        set(s => {
          const cost = 10;
          if (s.player.gold >= cost) {
            s.player.gold -= cost;
            s.player.hp = s.player.maxHp;
            s.player.mp = s.player.maxMp;
            s.messages.push(`🛏️ 旅館休息（-${cost}G），HP/MP 全滿`);
          } else {
            s.messages.push('💰 金幣不夠住旅館（需 10G）');
          }
        });
        // Auto-save after inn
        get().saveGame();
        return;
      }
      if (movedTile.type === 'dungeon-entry') {
        set(s => {
          s.player.position.mapId = 'dungeon';
          s.player.position.x = MAPS.dungeon.spawn.x;
          s.player.position.y = MAPS.dungeon.spawn.y;
          s.messages.push('🗝️ 進入幽影迷宮');
        });
        return;
      }
      if (movedTile.type === 'village-exit') {
        set(s => {
          s.player.position.mapId = 'village';
          s.player.position.x = MAPS.village.spawn.x;
          s.player.position.y = MAPS.village.spawn.y;
          s.messages.push('🏘️ 回到碧楓村');
        });
        get().saveGame();
        return;
      }
      if (movedTile.type === 'boss') {
        if (!get().bossDefeated) {
          get().startBattle('dragon', true);
        }
        return;
      }
      if (movedTile.type === 'treasure') {
        const flagKey = `treasure-${mapId}-${nx}-${ny}`;
        if (get().flags[flagKey]) {
          set(s => { s.messages.push('📭 空寶箱'); });
          return;
        }
        const content = MAPS[mapId].treasures?.[`${nx},${ny}`];
        if (content) {
          set(s => {
            addItem(s.player, content.itemId, content.count);
            const item = getItem(content.itemId);
            const name = item?.name ?? content.itemId;
            s.flags[flagKey] = true;
            s.messages.push(`📦 拾獲「${name}」×${content.count}`);
          });
          get().saveGame();
        }
        return;
      }

      // Random encounter in dungeon
      if (mapId === 'dungeon' && !get().bossDefeated) {
        const monsterId = rollEncounter('dungeon');
        if (monsterId) {
          get().startBattle(monsterId, false);
        }
      }
    },

    interactHere: () => {
      const { player } = get();
      const map = MAPS[player.position.mapId];
      const tile = map.tiles[player.position.y][player.position.x];
      if (tile.type === 'shop') get().openShop();
    },

    startBattle: (monsterId, isBoss = false) => {
      const m = MONSTERS[monsterId];
      if (!m) return;
      // Deep copy monster stats so we can mutate currentHp etc.
      const enemy: Monster = JSON.parse(JSON.stringify(m));
      const order = computeOrder(get().player.spd, enemy.spd);
      const log: string[] = [`⚔️ ${enemy.name} 出現了！`];
      if (order[0] === 'enemy') log.push('💨 敵方先攻');
      set(s => {
        s.scene = 'battle';
        s.player.defending = false;
        s.battle = {
          enemy,
          enemyCurrentHp: enemy.hp,
          enemyCurrentMp: enemy.mp,
          turn: 1,
          log,
          phase: order[0] === 'player' ? 'player' : 'enemy',
          isBoss,
          actionQueue: order,
          queueIndex: 0,
        };
      });
    },

    playerAct: (action, payload) => {
      const state = get();
      const b = state.battle;
      if (!b || b.phase !== 'player') return;

      // Reset defending each turn unless we choose defend
      set(s => { if (s.player.defending) s.player.defending = false; });

      switch (action) {
        case 'attack': {
          const skill = SKILLS['attack'];
          const { dmg, crit } = playerAttackDamage(state.player, b.enemy, skill);
          set(s => {
            if (!s.battle) return;
            s.battle.enemyCurrentHp = Math.max(0, s.battle.enemyCurrentHp - dmg);
            pushLog(s.battle, `🗡️ ${s.player.name} 攻擊，造成 ${dmg} 傷害${crit ? '（爆擊！）' : ''}`);
            s.battle.lastDamage = { target: 'enemy', amount: dmg, crit };
            s.battle.phase = 'animating';
          });
          break;
        }
        case 'skill': {
          const skill = SKILLS[payload ?? ''];
          if (!skill) return;
          if (state.player.mp < skill.mpCost) {
            set(s => { if (s.battle) pushLog(s.battle, `💧 MP 不足，無法使用 ${skill.name}`); });
            return;
          }
          set(s => { s.player.mp -= skill.mpCost; });
          if (skill.type === 'attack') {
            const { dmg, crit } = playerAttackDamage(state.player, b.enemy, skill);
            set(s => {
              if (!s.battle) return;
              s.battle.enemyCurrentHp = Math.max(0, s.battle.enemyCurrentHp - dmg);
              pushLog(s.battle, `🔥 ${s.player.name} 施放 ${skill.name}，造成 ${dmg} 傷害${crit ? '（爆擊！）' : ''}`);
              s.battle.lastDamage = { target: 'enemy', amount: dmg, crit };
              s.battle.phase = 'animating';
            });
          } else if (skill.type === 'heal') {
            set(s => {
              const before = s.player.hp;
              s.player.hp = Math.min(s.player.maxHp, s.player.hp + skill.power);
              if (s.battle) {
                pushLog(s.battle, `✨ ${s.player.name} 施放 ${skill.name}，回復 ${s.player.hp - before} HP`);
                s.battle.phase = 'animating';
              }
            });
          }
          break;
        }
        case 'item': {
          const itemId = payload ?? '';
          if (countOf(state.player, itemId) <= 0) return;
          set(s => {
            const desc = applyConsumable(s.player, itemId);
            if (!desc) return;
            removeItem(s.player, itemId, 1);
            const item = getItem(itemId);
            if (s.battle && item) {
              pushLog(s.battle, `🧪 使用「${item.name}」 — ${desc}`);
              s.battle.phase = 'animating';
            }
          });
          break;
        }
        case 'defend': {
          set(s => {
            s.player.defending = true;
            if (s.battle) {
              pushLog(s.battle, `🛡️ ${s.player.name} 進入防禦姿勢`);
              s.battle.phase = 'animating';
            }
          });
          break;
        }
        case 'flee': {
          const ok = tryFlee(state.player.spd, b.enemy.spd, b.isBoss);
          set(s => {
            if (!s.battle) return;
            if (ok) {
              pushLog(s.battle, `🏃 成功逃跑！`);
              s.battle.phase = 'fled';
            } else {
              pushLog(s.battle, `❌ 逃跑失敗⋯`);
              s.battle.phase = 'animating';
            }
          });
          break;
        }
      }

      // Check victory
      const post = get().battle;
      if (post && post.enemyCurrentHp <= 0) {
        const xp = b.enemy.xpReward;
        const gold = b.enemy.goldReward;
        set(s => {
          if (!s.battle) return;
          const result = applyXp(s.player, xp);
          s.player.gold += gold;
          pushLog(s.battle, `🎉 擊敗 ${s.battle.enemy.name}！+${xp} XP，+${gold} G`);
          if (result.leveledUp) {
            pushLog(s.battle, `⬆️ 升等！Lv ${result.from} → Lv ${result.to}（+${result.hpGained} HP / +${result.mpGained} MP）`);
          }
          // Drops
          if (s.battle.enemy.drops) {
            for (const drop of s.battle.enemy.drops) {
              if (chance(drop.chance)) {
                addItem(s.player, drop.itemId, 1);
                const it = getItem(drop.itemId);
                if (it && s.battle) pushLog(s.battle, `📦 拾獲「${it.name}」`);
              }
            }
          }
          s.battle.phase = 'won';
          if (s.battle.isBoss) s.bossDefeated = true;
        });
        get().saveGame();
        return;
      }

      // Animating phase set; Battle.tsx will call advanceTurn() after delay.
    },

    advanceTurn: () => {
      const b = get().battle;
      if (!b) return;
      if (b.phase === 'won' || b.phase === 'lost' || b.phase === 'fled') return;

      set(s => {
        if (!s.battle) return;
        s.battle.queueIndex += 1;
        if (s.battle.queueIndex >= s.battle.actionQueue.length) {
          // Turn end — recompute order for next turn (placeholder for future SPD buffs)
          s.battle.turn += 1;
          s.battle.queueIndex = 0;
          s.battle.actionQueue = computeOrder(s.player.spd, s.battle.enemy.spd);
        }
        const next = s.battle.actionQueue[s.battle.queueIndex];
        s.battle.phase = next === 'player' ? 'player' : 'enemy';
      });
    },

    enemyAct: () => {
      const state = get();
      const b = state.battle;
      if (!b || b.phase !== 'enemy') return;

      const intent = chooseEnemyAction(b.enemy, b.enemyCurrentHp, b.enemyCurrentMp, SKILLS);

      // === Item (heal) ===
      if (intent.type === 'item') {
        const item = getItem(intent.itemId);
        if (item?.effect?.type === 'heal') {
          const amount = item.effect.amount ?? 0;
          set(s => {
            if (!s.battle) return;
            const before = s.battle.enemyCurrentHp;
            s.battle.enemyCurrentHp = Math.min(s.battle.enemy.maxHp, before + amount);
            // Consume from AI pool
            const ai = s.battle.enemy.ai;
            if (ai) {
              const slot = ai.items.find(i => i.itemId === intent.itemId);
              if (slot) {
                slot.count -= 1;
                if (slot.count <= 0) ai.items = ai.items.filter(i => i.itemId !== intent.itemId);
              }
            }
            pushLog(s.battle, `💚 ${s.battle.enemy.name} 使用${item.name}，回復 ${s.battle.enemyCurrentHp - before} HP`);
            s.battle.lastDamage = undefined;
            s.battle.phase = 'animating';
          });
        }
        return;
      }

      // === Attack or skill — both deal damage to player ===
      const wasDefending = state.player.defending;
      let power = 1.0;
      let mpCost = 0;
      let logPrefix = '💢';
      let actionDesc = `${b.enemy.name} 反擊`;

      if (intent.type === 'skill') {
        const skill = SKILLS[intent.skillId];
        if (skill?.type === 'attack') {
          power = skill.power;
          mpCost = skill.mpCost;
          logPrefix = '🔥';
          actionDesc = `${b.enemy.name} 施放${skill.name}`;
        }
      }

      const { dmg, crit } = enemyAttackDamage(b.enemy, state.player, wasDefending, power);

      set(s => {
        s.player.hp = Math.max(0, s.player.hp - dmg);
        if (wasDefending) s.player.defending = false; // consume the defend stance
        if (s.battle) {
          if (mpCost > 0) s.battle.enemyCurrentMp = Math.max(0, s.battle.enemyCurrentMp - mpCost);
          pushLog(s.battle, `${logPrefix} ${actionDesc}，造成 ${dmg} 傷害${crit ? '（爆擊！）' : ''}`);
          s.battle.lastDamage = { target: 'player', amount: dmg, crit };
          s.battle.phase = 'animating';
        }
      });

      if (get().player.hp <= 0) {
        set(s => {
          if (s.battle) {
            pushLog(s.battle, `💀 你被打倒了⋯`);
            s.battle.phase = 'lost';
          }
        });
      }
    },

    closeBattle: () => {
      const b = get().battle;
      if (!b) return;
      if (b.phase === 'lost') {
        set(s => {
          s.battle = null;
          s.scene = 'gameover';
        });
        return;
      }
      set(s => {
        s.battle = null;
        s.scene = 'overworld';
      });
    },

    openShop: () => set(s => { s.shopOpen = true; }),
    closeShop: () => set(s => { s.shopOpen = false; }),

    buy: (itemId) => {
      const item = getItem(itemId);
      if (!item) return;
      set(s => {
        if (s.player.gold < item.price) {
          s.messages.push('💰 金幣不足');
          return;
        }
        s.player.gold -= item.price;
        addItem(s.player, itemId, 1);
        s.messages.push(`🛒 購買「${item.name}」`);
      });
    },

    sell: (itemId) => {
      const item = getItem(itemId);
      if (!item) return;
      const ok = countOf(get().player, itemId) > 0;
      if (!ok) return;
      set(s => {
        const sellPrice = Math.floor(item.price / 2);
        removeItem(s.player, itemId, 1);
        s.player.gold += sellPrice;
        s.messages.push(`💵 賣出「${item.name}」+${sellPrice}G`);
      });
    },

    equipItem: (itemId) => {
      set(s => {
        const ok = equip(s.player, itemId);
        if (ok) {
          const it = getItem(itemId);
          s.messages.push(`✅ 已裝備「${it?.name ?? itemId}」`);
        }
      });
    },

    useItem: (itemId) => {
      const item = getItem(itemId);
      if (!item || item.type !== 'consumable') return;
      if (countOf(get().player, itemId) <= 0) return;
      set(s => {
        const desc = applyConsumable(s.player, itemId);
        if (!desc) return;
        removeItem(s.player, itemId, 1);
        s.messages.push(`🧪 使用「${item.name}」 — ${desc}`);
      });
    },
  })),
);

export { SKILLS, MONSTERS, xpForNextLevel };
