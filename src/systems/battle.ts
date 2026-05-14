import type { BattleState, Monster, Player, Skill } from '../core/types';
import { chance, randInt } from '../core/rng';

const CRIT_CHANCE = 0.08;
const CRIT_MULT = 1.6;

export function computeDamage(
  attackerAtk: number,
  defenderDef: number,
  power: number,
  isDefending = false,
): { dmg: number; crit: boolean } {
  const crit = chance(CRIT_CHANCE);
  const variance = randInt(-2, 2);
  const baseDef = isDefending ? defenderDef * 2 : defenderDef;
  const raw = attackerAtk * power - baseDef + variance;
  const multiplied = crit ? raw * CRIT_MULT : raw;
  return { dmg: Math.max(1, Math.floor(multiplied)), crit };
}

// Returns `true` if escape succeeds. Faster than enemy → high chance.
export function tryFlee(playerSpd: number, enemySpd: number, isBoss: boolean): boolean {
  if (isBoss) return false;
  const ratio = playerSpd / Math.max(1, enemySpd);
  const p = Math.min(0.95, 0.4 + 0.4 * ratio);
  return chance(p);
}

// Very simple enemy AI: low HP -> attack hardest; otherwise normal attack.
export function enemyChooseAction(_enemy: Monster, _battle: BattleState): 'attack' {
  return 'attack';
}

export function playerAttackDamage(player: Player, enemy: Monster, skill: Skill) {
  return computeDamage(player.atk, enemy.def, skill.power, false);
}

export function enemyAttackDamage(enemy: Monster, player: Player, isDefending: boolean) {
  return computeDamage(enemy.atk, player.def, 1.0, isDefending);
}
