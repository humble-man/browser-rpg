import type { Player } from '../core/types';

// XP required to reach `level` from level 1. Smooth curve.
export function xpToReach(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(40 * Math.pow(level - 1, 1.55));
}

export function xpForNextLevel(currentLevel: number): number {
  return xpToReach(currentLevel + 1);
}

// Returns whether the player levelled up at least once and applies stat gains.
// May level up multiple times if a single XP grant pushes past multiple thresholds.
export function applyXp(player: Player, xpGain: number): {
  leveledUp: boolean;
  from: number;
  to: number;
  hpGained: number;
  mpGained: number;
} {
  const from = player.level;
  let hpGained = 0;
  let mpGained = 0;

  player.xp += xpGain;

  while (player.xp >= xpForNextLevel(player.level)) {
    player.level += 1;
    // Per-level gains for the warrior class
    const dHp = 6;
    const dMp = 2;
    const dAtk = 2;
    const dDef = 1;
    const dSpd = 1;
    player.maxHp += dHp;
    player.maxMp += dMp;
    player.atk += dAtk;
    player.def += dDef;
    player.spd += dSpd;
    // Full restore on level up (classic RPG behaviour)
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    hpGained += dHp;
    mpGained += dMp;
  }

  return { leveledUp: player.level > from, from, to: player.level, hpGained, mpGained };
}
