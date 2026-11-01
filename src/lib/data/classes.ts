/**
 * Pathfinder base class presets.
 *
 * Each preset carries the "specs" that used to be filled in by hand:
 * hit die, BAB progression, good/poor saves and skill ranks per level.
 */

export interface ClassPreset {
	name: string;
	hdSize: number;
	babProgression: 'fast' | 'medium' | 'slow';
	fortProgression: boolean;
	refProgression: boolean;
	willProgression: boolean;
	skillPointsPerLevel: number;
}

/** Core rulebook classes. */
export const coreClasses: ClassPreset[] = [
	{ name: 'Barbarian', hdSize: 12, babProgression: 'fast', fortProgression: true, refProgression: false, willProgression: false, skillPointsPerLevel: 4 },
	{ name: 'Bard', hdSize: 8, babProgression: 'medium', fortProgression: false, refProgression: true, willProgression: true, skillPointsPerLevel: 6 },
	{ name: 'Cleric', hdSize: 8, babProgression: 'medium', fortProgression: true, refProgression: false, willProgression: true, skillPointsPerLevel: 2 },
	{ name: 'Druid', hdSize: 8, babProgression: 'medium', fortProgression: true, refProgression: false, willProgression: true, skillPointsPerLevel: 4 },
	{ name: 'Fighter', hdSize: 10, babProgression: 'fast', fortProgression: true, refProgression: false, willProgression: false, skillPointsPerLevel: 2 },
	{ name: 'Monk', hdSize: 8, babProgression: 'medium', fortProgression: true, refProgression: true, willProgression: true, skillPointsPerLevel: 4 },
	{ name: 'Paladin', hdSize: 10, babProgression: 'fast', fortProgression: true, refProgression: false, willProgression: true, skillPointsPerLevel: 2 },
	{ name: 'Ranger', hdSize: 10, babProgression: 'fast', fortProgression: true, refProgression: true, willProgression: false, skillPointsPerLevel: 6 },
	{ name: 'Rogue', hdSize: 8, babProgression: 'medium', fortProgression: false, refProgression: true, willProgression: false, skillPointsPerLevel: 8 },
	{ name: 'Sorcerer', hdSize: 6, babProgression: 'slow', fortProgression: false, refProgression: false, willProgression: true, skillPointsPerLevel: 2 },
	{ name: 'Wizard', hdSize: 6, babProgression: 'slow', fortProgression: false, refProgression: false, willProgression: true, skillPointsPerLevel: 2 }
];

/** Advanced Player's Guide / Ultimate Magic base classes. */
export const baseClasses: ClassPreset[] = [
	{ name: 'Alchemist', hdSize: 8, babProgression: 'medium', fortProgression: true, refProgression: true, willProgression: false, skillPointsPerLevel: 4 },
	{ name: 'Cavalier', hdSize: 10, babProgression: 'fast', fortProgression: true, refProgression: false, willProgression: false, skillPointsPerLevel: 4 },
	{ name: 'Inquisitor', hdSize: 8, babProgression: 'medium', fortProgression: true, refProgression: false, willProgression: true, skillPointsPerLevel: 6 },
	{ name: 'Magus', hdSize: 8, babProgression: 'medium', fortProgression: true, refProgression: false, willProgression: true, skillPointsPerLevel: 2 },
	{ name: 'Oracle', hdSize: 8, babProgression: 'medium', fortProgression: false, refProgression: false, willProgression: true, skillPointsPerLevel: 4 },
	{ name: 'Summoner', hdSize: 8, babProgression: 'medium', fortProgression: false, refProgression: false, willProgression: true, skillPointsPerLevel: 2 },
	{ name: 'Witch', hdSize: 6, babProgression: 'slow', fortProgression: false, refProgression: false, willProgression: true, skillPointsPerLevel: 2 }
];

/** Every selectable class preset, grouped for use in an <optgroup> select. */
export const classGroups: Array<{ label: string; classes: ClassPreset[] }> = [
	{ label: 'Core Classes', classes: coreClasses },
	{ label: 'Base Classes', classes: baseClasses }
];

export const classPresets: ClassPreset[] = [...coreClasses, ...baseClasses];

export const classNames: string[] = classPresets.map((c) => c.name);

export function getClassPreset(name: string): ClassPreset | undefined {
	return classPresets.find((c) => c.name === name);
}
