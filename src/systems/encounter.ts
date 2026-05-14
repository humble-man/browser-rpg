import { MAPS } from '../data/maps';
import type { MapId } from '../core/types';
import { chance, pick } from '../core/rng';

export function rollEncounter(mapId: MapId): string | null {
  const map = MAPS[mapId];
  if (!map.encounters || !map.encounterRate) return null;
  if (!chance(map.encounterRate)) return null;
  return pick(map.encounters);
}
