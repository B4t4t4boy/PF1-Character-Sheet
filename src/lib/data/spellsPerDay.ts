/**
 * PF1 spells-per-day tables, transcribed from the official class tables
 * (Core Rulebook / Advanced Player's Guide, via d20pfsrd and Archives of Nethys).
 *
 * Values are BASE slots only — domain (cleric), specialization (wizard) and
 * high-ability bonus slots are not included. Each row is one class level
 * (index 0 = level 1); entries are spell levels 0..maxSpellLevel where
 * -1 means that spell level is not yet available.
 */

export interface SpellsPerDayTable {
	/** Highest spell level the class can cast (9, 6 or 4). */
	maxSpellLevel: number;
	/** True when 0-level spells don't consume slots (cast at will). */
	cantripsAtWill: boolean;
	/** Base slots per day, one row per class level 1-20. */
	rows: number[][];
}

/**
 * Pads short rows to a fixed width using -1 (spell level not available).
 *
 * `hasZeroLevel` tables (prepared casters and magus) include a 0-level column
 * in their source rows. All other tables start at 1st level, so a -1
 * placeholder is prepended to keep row index aligned with spell level.
 */
function pad(rows: number[][], width: number, hasZeroLevel: boolean): number[][] {
	return rows.map((row) => {
		const source = hasZeroLevel ? row : [-1, ...row];
		return Array.from({ length: width }, (_, i) => source[i] ?? -1);
	});
}

/** Shared 9-level prepared progression: Wizard, Cleric, Druid, Witch. */
const PREPARED_9 = pad([
	[3, 1], [4, 2], [4, 2, 1], [4, 3, 2], [4, 3, 2, 1],
	[4, 3, 3, 2], [4, 4, 3, 2, 1], [4, 4, 3, 3, 2], [4, 4, 4, 3, 2, 1], [4, 4, 4, 3, 3, 2],
	[4, 4, 4, 4, 3, 2, 1], [4, 4, 4, 4, 3, 3, 2], [4, 4, 4, 4, 4, 3, 2, 1], [4, 4, 4, 4, 4, 3, 3, 2],
	[4, 4, 4, 4, 4, 4, 3, 2, 1], [4, 4, 4, 4, 4, 4, 3, 3, 2], [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
	[4, 4, 4, 4, 4, 4, 4, 3, 3, 2], [4, 4, 4, 4, 4, 4, 4, 4, 3, 3], [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
], 10, true);

/** Sorcerer (spontaneous 9-level; cantrips at will). */
const SORCERER = pad([
	[3], [4], [5], [6, 3], [6, 4], [6, 5, 3], [6, 6, 4], [6, 6, 5, 3], [6, 6, 6, 4], [6, 6, 6, 5, 3],
	[6, 6, 6, 6, 4], [6, 6, 6, 6, 5, 3], [6, 6, 6, 6, 6, 4], [6, 6, 6, 6, 6, 5, 3],
	[6, 6, 6, 6, 6, 6, 4], [6, 6, 6, 6, 6, 6, 5, 3], [6, 6, 6, 6, 6, 6, 6, 4],
	[6, 6, 6, 6, 6, 6, 6, 5, 3], [6, 6, 6, 6, 6, 6, 6, 6, 4], [6, 6, 6, 6, 6, 6, 6, 6, 6]
], 10, false);

/** Oracle (spontaneous 9-level; cantrips at will). */
const ORACLE = pad([
	[3], [4], [5], [6, 3], [6, 4], [6, 5, 3], [6, 6, 4], [6, 6, 5, 3], [6, 6, 6, 4], [6, 6, 6, 5, 3],
	[6, 6, 6, 6, 4], [6, 6, 6, 6, 5, 3], [6, 6, 6, 6, 6, 4], [6, 6, 6, 6, 6, 5, 3],
	[6, 6, 6, 6, 6, 6, 4], [6, 6, 6, 6, 6, 6, 5, 3], [6, 6, 6, 6, 6, 6, 6, 4],
	[6, 6, 6, 6, 6, 6, 6, 5, 3], [6, 6, 6, 6, 6, 6, 6, 6, 4], [6, 6, 6, 6, 6, 6, 6, 6, 6]
], 10, false);

/** Shared 6-level spontaneous progression: Bard, Alchemist, Inquisitor, Summoner. */
const SPONTANEOUS_6 = pad([
	[1], [2], [3], [3, 1], [4, 2], [4, 3], [4, 3, 1], [4, 4, 2], [5, 4, 3], [5, 4, 3, 1],
	[5, 4, 4, 2], [5, 5, 4, 3], [5, 5, 4, 3, 1], [5, 5, 4, 4, 2], [5, 5, 5, 4, 3],
	[5, 5, 5, 4, 3, 1], [5, 5, 5, 4, 4, 2], [5, 5, 5, 5, 4, 3], [5, 5, 5, 5, 5, 4], [5, 5, 5, 5, 5, 5]
], 7, false);

/** Magus (6-level caster with slotted cantrips). */
const MAGUS = pad([
	[3, 1], [4, 2], [4, 3], [4, 3, 1], [4, 4, 2], [5, 4, 3], [5, 4, 3, 1], [5, 4, 4, 2],
	[5, 5, 4, 3], [5, 5, 4, 3, 1], [5, 5, 4, 4, 2], [5, 5, 5, 4, 3], [5, 5, 5, 4, 3, 1],
	[5, 5, 5, 4, 4, 2], [5, 5, 5, 5, 4, 3], [5, 5, 5, 5, 4, 3, 1], [5, 5, 5, 5, 4, 4, 2],
	[5, 5, 5, 5, 5, 4, 3], [5, 5, 5, 5, 5, 5, 4], [5, 5, 5, 5, 5, 5, 5]
], 7, true);

/** Shared half-caster progression: Paladin, Ranger (casting starts at 4th level). */
const HALF_CASTER = pad([
	[], [], [], [0], [1], [1], [1, 0], [1, 1], [2, 1], [2, 1, 0],
	[2, 1, 1], [2, 2, 1], [3, 2, 1, 0], [3, 2, 1, 1], [3, 2, 2, 1],
	[3, 3, 2, 1], [4, 3, 2, 1], [4, 3, 2, 2], [4, 3, 3, 2], [4, 4, 3, 3]
], 5, false);

/** Spells per day for every class with a known casting progression. */
export const spellsPerDayTables: Record<string, SpellsPerDayTable> = {
	Wizard: { maxSpellLevel: 9, cantripsAtWill: false, rows: PREPARED_9 },
	Cleric: { maxSpellLevel: 9, cantripsAtWill: false, rows: PREPARED_9 },
	Druid: { maxSpellLevel: 9, cantripsAtWill: false, rows: PREPARED_9 },
	Witch: { maxSpellLevel: 9, cantripsAtWill: false, rows: PREPARED_9 },
	Sorcerer: { maxSpellLevel: 9, cantripsAtWill: true, rows: SORCERER },
	Oracle: { maxSpellLevel: 9, cantripsAtWill: true, rows: ORACLE },
	Bard: { maxSpellLevel: 6, cantripsAtWill: true, rows: SPONTANEOUS_6 },
	Alchemist: { maxSpellLevel: 6, cantripsAtWill: false, rows: SPONTANEOUS_6 },
	Inquisitor: { maxSpellLevel: 6, cantripsAtWill: true, rows: SPONTANEOUS_6 },
	Summoner: { maxSpellLevel: 6, cantripsAtWill: true, rows: SPONTANEOUS_6 },
	Magus: { maxSpellLevel: 6, cantripsAtWill: false, rows: MAGUS },
	Paladin: { maxSpellLevel: 4, cantripsAtWill: false, rows: HALF_CASTER },
	Ranger: { maxSpellLevel: 4, cantripsAtWill: false, rows: HALF_CASTER }
};

/**
 * Spells-known progressions for the spontaneous casters (Sorcerer, Oracle,
 * Bard, Inquisitor, Summoner). Rows are class levels 1-20; entries are spell
 * levels 0..highest known (a missing entry means the level is not available).
 * Prepared casters are absent — they choose from their full class list.
 */
const KNOWN_9: number[][] = [
	[4, 2], [5, 2], [5, 3], [6, 3, 1], [6, 4, 2], [7, 4, 2, 1], [7, 5, 3, 2],
	[8, 5, 3, 2, 1], [8, 5, 4, 3, 2], [9, 5, 4, 3, 2, 1], [9, 5, 5, 4, 3, 2],
	[9, 5, 5, 4, 3, 2, 1], [9, 5, 5, 4, 4, 3, 2], [9, 5, 5, 4, 4, 3, 2, 1],
	[9, 5, 5, 4, 4, 4, 3, 2], [9, 5, 5, 4, 4, 4, 3, 2, 1], [9, 5, 5, 4, 4, 4, 3, 3, 2],
	[9, 5, 5, 4, 4, 4, 3, 3, 2, 1], [9, 5, 5, 4, 4, 4, 3, 3, 3, 2], [9, 5, 5, 4, 4, 4, 3, 3, 3, 3]
];

const KNOWN_6: number[][] = [
	[4, 2], [5, 3], [6, 4], [6, 4, 2], [6, 4, 3], [6, 4, 4], [6, 5, 4, 2],
	[6, 5, 4, 3], [6, 5, 4, 4], [6, 5, 5, 4, 2], [6, 6, 5, 4, 3], [6, 6, 5, 4, 4],
	[6, 6, 5, 5, 4, 2], [6, 6, 6, 5, 4, 3], [6, 6, 6, 5, 4, 4], [6, 6, 6, 5, 5, 4, 2],
	[6, 6, 6, 6, 5, 4, 3], [6, 6, 6, 6, 5, 4, 4], [6, 6, 6, 6, 5, 5, 4], [6, 6, 6, 6, 6, 5, 5]
];

/** Spells known per class level; classes without an entry prepare from their full list. */
export const spellsKnownTables: Record<string, number[][]> = {
	Sorcerer: KNOWN_9,
	Oracle: KNOWN_9,
	Bard: KNOWN_6,
	Inquisitor: KNOWN_6,
	Summoner: KNOWN_6
};