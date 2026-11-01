/**
 * Pathfinder 1e spell metadata: magic schools and casting-class presets
 * used to derive caster level and casting ability.
 */

export const magicSchools = [
	'Abjuration',
	'Conjuration',
	'Divination',
	'Enchantment',
	'Evocation',
	'Illusion',
	'Necromancy',
	'Transmutation'
] as const;
export type MagicSchool = (typeof magicSchools)[number];

/** Common PF1 casting times; anything else is entered as a custom value. */
export const castingTimePresets: string[] = [
	'1 standard action',
	'1 swift action',
	'1 immediate action',
	'1 full-round action',
	'1 round',
	'1 minute',
	'10 minutes',
	'1 hour'
];

export interface CastingClassInfo {
	/** Ability used for spell DCs and concentration checks. */
	castingAbility: 'int' | 'wis' | 'cha';
	/** Full casters gain 1 CL per level; half casters start 3 levels behind. */
	progression: 'full' | 'half';
}

/** Classes with a defined casting ability and caster level progression. */
export const castingClasses: Record<string, CastingClassInfo> = {
	Bard: { castingAbility: 'cha', progression: 'full' },
	Cleric: { castingAbility: 'wis', progression: 'full' },
	Druid: { castingAbility: 'wis', progression: 'full' },
	Sorcerer: { castingAbility: 'cha', progression: 'full' },
	Wizard: { castingAbility: 'int', progression: 'full' },
	Alchemist: { castingAbility: 'int', progression: 'full' },
	Inquisitor: { castingAbility: 'wis', progression: 'full' },
	Magus: { castingAbility: 'int', progression: 'full' },
	Oracle: { castingAbility: 'cha', progression: 'full' },
	Summoner: { castingAbility: 'cha', progression: 'full' },
	Witch: { castingAbility: 'int', progression: 'full' },
	Paladin: { castingAbility: 'wis', progression: 'half' },
	Ranger: { castingAbility: 'wis', progression: 'half' }
};