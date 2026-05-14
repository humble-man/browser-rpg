import type { EnemyActionIntent, Monster, Skill } from '../core/types';
import { chance } from '../core/rng';

const HEAL_THRESHOLD = 0.3;
const SKILL_CHANCE = 0.3;

export function chooseEnemyAction(
  enemy: Monster,
  currentHp: number,
  currentMp: number,
  skills: Record<string, Skill>,
): EnemyActionIntent {
  if (!enemy.ai) return { type: 'attack' };

  // Low HP → try heal
  if (currentHp / enemy.maxHp < HEAL_THRESHOLD) {
    const available = enemy.ai.items.find(i => i.count > 0);
    if (available) return { type: 'item', itemId: available.itemId };
  }

  // Maybe cast an offensive skill
  for (const skillId of enemy.ai.skills) {
    const sk = skills[skillId];
    if (sk?.type === 'attack' && currentMp >= sk.mpCost && chance(SKILL_CHANCE)) {
      return { type: 'skill', skillId };
    }
  }

  return { type: 'attack' };
}
