export type SceneId = 'title' | 'overworld' | 'battle' | 'shop' | 'gameover';

export type MapId = 'village' | 'dungeon';

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface InventoryItem {
  itemId: string;
  count: number;
}

export interface Equipment {
  weapon: string | null;
  armor: string | null;
}

export interface Player extends Stats {
  name: string;
  level: number;
  xp: number;
  gold: number;
  skills: string[];
  inventory: InventoryItem[];
  equipment: Equipment;
  position: { mapId: MapId; x: number; y: number };
  defending: boolean;
}

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  xpReward: number;
  goldReward: number;
  drops?: { itemId: string; chance: number }[];
}

export type ItemType = 'consumable' | 'weapon' | 'armor';
export type ItemEffectType = 'heal' | 'restoreMp' | 'cure';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  effect?: { type: ItemEffectType; amount?: number };
  bonus?: Partial<Pick<Stats, 'atk' | 'def' | 'spd' | 'maxHp' | 'maxMp'>>;
}

export type SkillType = 'attack' | 'heal';

export interface Skill {
  id: string;
  name: string;
  mpCost: number;
  type: SkillType;
  power: number;
  description: string;
}

export type TileType =
  | 'grass'
  | 'wall'
  | 'shop'
  | 'inn'
  | 'dungeon-entry'
  | 'village-exit'
  | 'boss'
  | 'sign'
  | 'floor';

export interface MapTile {
  type: TileType;
  label?: string;
}

export interface GameMap {
  id: MapId;
  name: string;
  width: number;
  height: number;
  tiles: MapTile[][];
  encounters?: string[];
  encounterRate?: number;
  spawn: { x: number; y: number };
}

export type BattlePhase = 'player' | 'animating' | 'enemy' | 'won' | 'lost' | 'fled';

export interface BattleState {
  enemy: Monster;
  enemyCurrentHp: number;
  enemyCurrentMp: number;
  turn: number;
  log: string[];
  phase: BattlePhase;
  isBoss: boolean;
  lastDamage?: { target: 'player' | 'enemy'; amount: number; crit?: boolean };
}
