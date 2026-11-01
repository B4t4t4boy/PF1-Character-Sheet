import { db, type CharacterEntity } from '$lib/db';

/**
 * A single weapon row on the Combat tab.
 */
export interface WeaponData {
	id: string;
	name: string;
	/** Melee weapons add Str by default, ranged weapons add Dex; unusual cases (finesse, thrown) stay user-selectable. */
	attackType: 'melee' | 'ranged';
	attackAbility: 'str' | 'dex';
	/** Magic enhancement bonus; applies to both attack and damage. */
	enhancement: number;
	/** Other attack modifiers (feats, buffs, penalties, etc.). */
	miscAttack: number;
	/** Damage dice expression, e.g. "1d8". */
	damageDice: string;
	/** Ability added to damage; "none" for most ranged weapons. */
	damageAbility: 'str' | 'dex' | 'none';
	/** Grip used — affects the Strength multiplier on melee damage. */
	handedness: 'one-handed' | 'two-handed' | 'off-hand';
	/** Other damage modifiers (weapon specialization, buffs, etc.). */
	miscDamage: number;
	/** Critical line, e.g. "19-20/x2". */
	critical: string;
	/** Range increment in meters; 0 for melee-only weapons. */
	rangeIncrement: number;
	ammunition: string;
	notes: string;
}

/**
 * A single spell card on the Spells tab, following the PF1 spell statblock.
 */
export interface SpellData {
	id: string;
	name: string;
	/** 0 (cantrip/orison) through 9. */
	level: number;
	school: string;
	/** Subschool and descriptors, e.g. "fire", "mind-affecting". */
	subschoolDescriptors: string;
	/** e.g. "V, S, M (a pinch of sulfur)". */
	components: string;
	/** e.g. "1 standard action". */
	castingTime: string;
	/** Range increase per caster level, in meters. */
	rangePerLevel: number;
	/** Raw base range in meters; total range = raw + per level × caster level. */
	rangeBase: number;
	/** Targets line, e.g. "one creature/level". */
	targets: string;
	/** Area line, e.g. "20-ft.-radius burst". */
	area: string;
	/** Effect line, e.g. "ray". */
	effect: string;
	/** e.g. "instantaneous", "1 round/level". */
	duration: string;
	/** e.g. "Reflex half", "Will negates", "none". */
	savingThrow: string;
	spellResistance: boolean;
	description: string;
}

/** Spellcasting settings for the Spells tab. */
export interface SpellcastingData {
	/** 'auto' derives the casting ability from the character's casting class. */
	ability: 'auto' | 'int' | 'wis' | 'cha';
	/** Bonus caster levels from items, feats, etc. */
	miscCasterLevel: number;
}

export interface CharacterData {
	characterName: string;
	classLevel: string;
	alignment: string;
	deity: string;
	player: string;
	race: string;
	size: 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';
	gender: string;
	age: number;
	height: string;
	weight: string;
	hair: string;
	eyes: string;
	abilities: {
		str: number;
		dex: number;
		con: number;
		int: number;
		wis: number;
		cha: number;
	};
	hp: {
		current: number;
		max: number;
		nonLethal: number;
	};
	ac: {
		total: number;
		flatFooted: number;
		touch: number;
	};
	saves: {
		fort: { base: number; ability: number; magic: number; misc: number; temp: number };
		ref: { base: number; ability: number; magic: number; misc: number; temp: number };
		will: { base: number; ability: number; magic: number; misc: number; temp: number };
	};
	initiative: { dex: number; misc: number };
	bab: number;
	cmb: number;
	cmd: number;
	skills: Array<{
		name: string;
		ranks: number;
		classSkill: boolean;
		abilityMod: number;
		miscMod: number;
	}>;
	classes: Array<{
		name: string;
		level: number;
		hdSize: number;
		babProgression: 'fast' | 'medium' | 'slow';
		fortProgression: boolean;
		refProgression: boolean;
		willProgression: boolean;
		skillPointsPerLevel: number;
	}>;
	weapons: WeaponData[];
	spells: SpellData[];
	spellcasting: SpellcastingData;
	inventory: Array<{
		name: string;
		qty: number;
		weight: number;
		location: string;
		notes: string;
	}>;
	feats: Array<{
		name: string;
		description: string;
	}>;
	specialAbilities: Array<{
		name: string;
		description: string;
	}>;
	notes: string;
}

export function createDefaultCharacter(): CharacterData {
	return {
		characterName: '',
		classLevel: '',
		alignment: '',
		deity: '',
		player: '',
		race: '',
		size: 'Medium',
		gender: '',
		age: 0,
		height: '',
		weight: '',
		hair: '',
		eyes: '',
		abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
		hp: { current: 10, max: 10, nonLethal: 0 },
		ac: { total: 10, flatFooted: 10, touch: 10 },
		saves: {
			fort: { base: 0, ability: 0, magic: 0, misc: 0, temp: 0 },
			ref: { base: 0, ability: 0, magic: 0, misc: 0, temp: 0 },
			will: { base: 0, ability: 0, magic: 0, misc: 0, temp: 0 }
		},
		initiative: { dex: 0, misc: 0 },
		bab: 0,
		cmb: 0,
		cmd: 10,
		skills: [],
		classes: [],
		weapons: [],
		spells: [],
		spellcasting: { ability: 'auto', miscCasterLevel: 0 },
		inventory: [],
		feats: [],
		specialAbilities: [],
		notes: ''
	};
}

function newId(): string {
	return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
		? crypto.randomUUID()
		: `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates a blank weapon row with sensible defaults for its attack type. */
export function createDefaultWeapon(attackType: 'melee' | 'ranged'): WeaponData {
	return {
		id: newId(),
		name: '',
		attackType,
		attackAbility: attackType === 'melee' ? 'str' : 'dex',
		enhancement: 0,
		miscAttack: 0,
		damageDice: attackType === 'melee' ? '1d6' : '1d8',
		damageAbility: attackType === 'melee' ? 'str' : 'none',
		handedness: 'one-handed',
		miscDamage: 0,
		critical: '20/x2',
		rangeIncrement: attackType === 'ranged' ? 30 : 0,
		ammunition: '',
		notes: ''
	};
}

/** Creates a blank spell card with typical PF1 statblock defaults. */
export function createDefaultSpell(): SpellData {
	return {
		id: newId(),
		name: '',
		level: 1,
		school: '',
		subschoolDescriptors: '',
		components: 'V, S',
		castingTime: '1 standard action',
		rangePerLevel: 3,
		rangeBase: 30,
		targets: '',
		area: '',
		effect: '',
		duration: '',
		savingThrow: '',
		spellResistance: false,
		description: ''
	};
}

function asNumber(value: unknown, fallback: number): number {
	return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
	return typeof value === 'string' ? value : fallback;
}

/** Upgrades a persisted weapon (possibly from an older schema) to the current WeaponData shape. */
function normalizeWeapon(raw: Record<string, unknown>): WeaponData {
	const attackType = raw.attackType === 'ranged' ? 'ranged' : 'melee';
	const legacyRange = parseInt(asString(raw.range, ''), 10);
	return {
		id: asString(raw.id, '') || newId(),
		name: asString(raw.name, ''),
		attackType,
		attackAbility: raw.attackAbility === 'dex' || raw.attackAbility === 'str'
			? raw.attackAbility
			: attackType === 'ranged' ? 'dex' : 'str',
		enhancement: asNumber(raw.enhancement, 0),
		// Older saves stored a single hand-entered total as "attackBonus".
		miscAttack: asNumber(raw.miscAttack, asNumber(raw.attackBonus, 0)),
		damageDice: asString(raw.damageDice, '') || asString(raw.damage, '') || (attackType === 'melee' ? '1d6' : '1d8'),
		damageAbility: raw.damageAbility === 'str' || raw.damageAbility === 'dex' || raw.damageAbility === 'none'
			? raw.damageAbility
			: attackType === 'melee' ? 'str' : 'none',
		handedness: raw.handedness === 'two-handed' || raw.handedness === 'off-hand'
			? raw.handedness
			: 'one-handed',
		miscDamage: asNumber(raw.miscDamage, 0),
		critical: asString(raw.critical, '') || '20/x2',
		rangeIncrement: asNumber(
			raw.rangeIncrement,
			Number.isNaN(legacyRange) ? (attackType === 'ranged' ? 30 : 0) : legacyRange
		),
		ammunition: asString(raw.ammunition, ''),
		notes: asString(raw.notes, '')
	};
}

/** Upgrades a persisted spell (possibly from an older schema) to the current SpellData shape. */
function normalizeSpell(raw: Record<string, unknown>): SpellData {
	return {
		id: asString(raw.id, '') || newId(),
		name: asString(raw.name, ''),
		level: asNumber(raw.level, 1),
		school: asString(raw.school, ''),
		subschoolDescriptors: asString(raw.subschoolDescriptors, ''),
		components: asString(raw.components, '') || 'V, S',
		castingTime: asString(raw.castingTime, '') || '1 standard action',
		rangePerLevel: asNumber(raw.rangePerLevel, 3),
		rangeBase: asNumber(raw.rangeBase, 30),
		targets: asString(raw.targets, ''),
		area: asString(raw.area, ''),
		effect: asString(raw.effect, ''),
		duration: asString(raw.duration, ''),
		savingThrow: asString(raw.savingThrow, ''),
		spellResistance: raw.spellResistance === true,
		description: asString(raw.description, '')
	};
}

/** Normalizes loaded/imported data so older saves keep working with the current schema. */
export function normalizeCharacterData(data: CharacterData): CharacterData {
	const raw = data as unknown as Record<string, unknown>;
	const spellcasting = raw.spellcasting as Record<string, unknown> | undefined;
	const ability = spellcasting?.ability;
	return {
		...data,
		weapons: (Array.isArray(data.weapons) ? data.weapons : []).map(
			(w) => normalizeWeapon(w as unknown as Record<string, unknown>)
		),
		spells: (Array.isArray(data.spells) ? data.spells : []).map(
			(s) => normalizeSpell(s as unknown as Record<string, unknown>)
		),
		spellcasting: {
			ability: ability === 'auto' || ability === 'int' || ability === 'wis' || ability === 'cha'
				? ability
				: 'auto',
			miscCasterLevel: asNumber(spellcasting?.miscCasterLevel, 0)
		}
	};
}

export async function saveCharacter(name: string, data: CharacterData): Promise<number> {
	const existing = await db.characters.where('name').equals(name).first();
	const now = new Date();

	if (existing) {
		await db.characters.update(existing.id!, {
			data: data as unknown as Record<string, unknown>,
			updatedAt: now
		});
		return existing.id!;
	} else {
		return db.characters.add({
			name,
			data: data as unknown as Record<string, unknown>,
			createdAt: now,
			updatedAt: now
		}).then(id => id!);
	}
}

export async function loadCharacter(id: number): Promise<CharacterData | null> {
	const entity = await db.characters.get(id);
	if (!entity) return null;
	return normalizeCharacterData(entity.data as unknown as CharacterData);
}

export async function loadCharacterByName(name: string): Promise<CharacterEntity | undefined> {
	return db.characters.where('name').equals(name).first();
}

export async function listCharacters(): Promise<Array<{ id: number; name: string; updatedAt: Date }>> {
	return db.characters.orderBy('updatedAt').reverse().toArray().then(
		entries => entries.map(e => ({ id: e.id!, name: e.name, updatedAt: e.updatedAt }))
	);
}

export async function deleteCharacter(id: number): Promise<void> {
	await db.characters.delete(id);
}

export function exportToJson(data: CharacterData): string {
	return JSON.stringify(data, null, 2);
}

export function importFromJson(json: string): CharacterData {
	return normalizeCharacterData(JSON.parse(json) as CharacterData);
}