import { calcModifier, calcBAB, calcCMB, calcCMD, calcSave,
	calcTotalAC,
	formatAttackLine,
	formatDamage,
	calcMeleeStrengthMultiplier,
	calcSpellDC,
	calcConcentrationDC,
	calcTotalSpellRange
} from '$lib/utils/math';
import { createDefaultCharacter, type CharacterData } from '$lib/utils/persistence';
import { castingClasses, type CastingClassInfo } from '$lib/data/spells';
import { spellsPerDayTables, spellsKnownTables } from '$lib/data/spellsPerDay';
import { skills as skillDefs, type SkillDefinition } from '$lib/data/skills';

/**
 * Creates a reactive character state using Svelte 5 runes.
 */
export function createCharacterState(initial?: CharacterData) {
	const data = $state<CharacterData>(initial ?? createDefaultCharacter());

	// --- Derived ability modifiers ---
	const strMod = $derived(calcModifier(data.abilities.str));
	const dexMod = $derived(calcModifier(data.abilities.dex));
	const conMod = $derived(calcModifier(data.abilities.con));
	const intMod = $derived(calcModifier(data.abilities.int));
	const wisMod = $derived(calcModifier(data.abilities.wis));
	const chaMod = $derived(calcModifier(data.abilities.cha));

	// --- Derived BAB, CMB, CMD ---
	const totalBAB = $derived(
		data.classes.reduce((sum, cls) => sum + calcBAB(cls.level, cls.babProgression), 0)
	);

	const cmb = $derived(calcCMB(totalBAB, strMod));
	const cmd = $derived(calcCMD(totalBAB, strMod, dexMod));

	// --- Derived Saves ---
	const fortSave = $derived(
		data.classes.reduce((sum, cls) => sum + calcSave(cls.level, cls.fortProgression), 0)
	);
	const refSave = $derived(
		data.classes.reduce((sum, cls) => sum + calcSave(cls.level, cls.refProgression), 0)
	);
	const willSave = $derived(
		data.classes.reduce((sum, cls) => sum + calcSave(cls.level, cls.willProgression), 0)
	);

	// --- Derived AC ---
	const totalAC = $derived(
		calcTotalAC(10, data.ac.total - 10, 0, dexMod, 99, 0, 0, 0, 0)
	);

	// --- Derived initiative ---
	const initiative = $derived(dexMod + data.initiative.misc);

	// --- Derived basic attacks (melee = BAB + STR, ranged = BAB + DEX) ---
	const meleeAttackTotal = $derived(totalBAB + strMod);
	const rangedAttackTotal = $derived(totalBAB + dexMod);
	const meleeAttackLine = $derived(formatAttackLine(totalBAB, strMod));
	const rangedAttackLine = $derived(formatAttackLine(totalBAB, dexMod));

	// --- Derived weapon attack and damage lines ---
	const weaponAttacks = $derived(
		data.weapons.map((weapon) => {
			const attackAbilityMod = weapon.attackAbility === 'dex' ? dexMod : strMod;
			const attackMods = attackAbilityMod + weapon.enhancement + weapon.miscAttack;
			const damageAbilityMod = weapon.damageAbility === 'str'
				? strMod
				: weapon.damageAbility === 'dex'
					? dexMod
					: 0;
			const strengthMultiplier = weapon.attackType === 'melee' && weapon.damageAbility === 'str'
				? calcMeleeStrengthMultiplier(weapon.handedness)
				: 1;
			const damageBonus = Math.floor(damageAbilityMod * strengthMultiplier)
				+ weapon.enhancement
				+ weapon.miscDamage;
			return {
				id: weapon.id,
				attackTotal: totalBAB + attackMods,
				attackLine: formatAttackLine(totalBAB, attackMods),
				damage: formatDamage(weapon.damageDice, damageBonus),
				damageBonus
			};
		})
	);

	// --- Derived spellcasting ---
	const detectedCastingClass = $derived(
		data.classes.reduce<{ name: string; level: number; info: CastingClassInfo } | null>((best, cls) => {
			const info = castingClasses[cls.name];
			if (info && (!best || cls.level > best.level)) {
				return { name: cls.name, level: cls.level, info };
			}
			return best;
		}, null)
	);
	const castingAbility = $derived<'int' | 'wis' | 'cha'>(
		data.spellcasting.ability === 'auto'
			? (detectedCastingClass?.info.castingAbility ?? 'int')
			: data.spellcasting.ability
	);
	const castingAbilityMod = $derived(
		castingAbility === 'int' ? intMod : castingAbility === 'wis' ? wisMod : chaMod
	);
	const casterLevel = $derived(
		(detectedCastingClass
			? detectedCastingClass.info.progression === 'full'
				? detectedCastingClass.level
				: Math.max(0, detectedCastingClass.level - 3)
			: 0) + data.spellcasting.miscCasterLevel
	);
	const concentrationTotal = $derived(casterLevel + castingAbilityMod);

	// --- Derived spell totals ---
	const spellTotals = $derived(
		data.spells.map((spell) => {
			return {
				id: spell.id,
				saveDC: calcSpellDC(spell.level, castingAbilityMod),
				concentrationDC: calcConcentrationDC(spell.level),
				totalRange: calcTotalSpellRange(spell.rangeBase, spell.rangePerLevel, casterLevel)
			};
		})
	);

	// --- Derived spells per day ---
	const spellsPerDayInfo = $derived.by(() => {
		if (!detectedCastingClass) return null;
		const table = spellsPerDayTables[detectedCastingClass.name];
		if (!table) return null;
		const knownTable = spellsKnownTables[detectedCastingClass.name];
		const classLevel = Math.min(Math.max(detectedCastingClass.level, 1), 20);
		const row = table.rows[classLevel - 1];
		const levels = row
			.map((base, level) => {
				const atWill = level === 0 && table.cantripsAtWill;
				if (base < 0 && !atWill) return null;
				// A high casting ability grants +1 bonus slot per spell level, 1st up to the modifier.
				const bonus = level >= 1 && level <= castingAbilityMod ? 1 : 0;
				return {
					level,
					atWill,
					base: atWill ? 0 : base,
					bonus: atWill ? 0 : bonus,
					total: atWill ? 0 : base + bonus,
					known: knownTable?.[classLevel - 1]?.[level] ?? -1,
					saveDC: calcSpellDC(level, castingAbilityMod)
				};
			})
			.filter((entry) => entry !== null);
		return {
			className: detectedCastingClass.name,
			classLevel,
			hasKnownTable: knownTable !== undefined,
			levels
		};
	});

	// --- Derived total HP from classes ---
	const totalMaxHP = $derived(
		data.classes.reduce((sum, cls) => {
			let hp = cls.hdSize + conMod;
			for (let i = 1; i < cls.level; i++) {
				hp += Math.floor(cls.hdSize / 2) + 1 + conMod;
			}
			return sum + hp;
		}, 0)
	);

	// --- Derived skill totals ---
	const skillTotals = $derived(
		skillDefs.map(skill => {
			const rank = data.skills.find(s => s.name === skill.name)?.ranks ?? 0;
			const classSkill = data.skills.find(s => s.name === skill.name)?.classSkill ?? false;
			const abilityScore = data.abilities[skill.ability];
			const abilityMod = calcModifier(abilityScore);
			const miscMod = data.skills.find(s => s.name === skill.name)?.miscMod ?? 0;
			const acpPenalty = skill.armorCheckPenalty ? 0 : 0; // TODO: calculate actual ACP
			const total = rank + abilityMod + miscMod + (classSkill && rank > 0 ? 3 : 0) + acpPenalty;
			return { name: skill.name, rank, classSkill, abilityMod, miscMod, total };
		})
	);

	return {
		get data() { return data; },
		get strMod() { return strMod; },
		get dexMod() { return dexMod; },
		get conMod() { return conMod; },
		get intMod() { return intMod; },
		get wisMod() { return wisMod; },
		get chaMod() { return chaMod; },
		get totalBAB() { return totalBAB; },
		get cmb() { return cmb; },
		get cmd() { return cmd; },
		get fortSave() { return fortSave; },
		get refSave() { return refSave; },
		get willSave() { return willSave; },
		get totalAC() { return totalAC; },
		get initiative() { return initiative; },
		get meleeAttackTotal() { return meleeAttackTotal; },
		get rangedAttackTotal() { return rangedAttackTotal; },
		get meleeAttackLine() { return meleeAttackLine; },
		get rangedAttackLine() { return rangedAttackLine; },
		get weaponAttacks() { return weaponAttacks; },
		get castingAbility() { return castingAbility; },
		get castingAbilityMod() { return castingAbilityMod; },
		get casterLevel() { return casterLevel; },
		get concentrationTotal() { return concentrationTotal; },
		get detectedCastingClassName() { return detectedCastingClass?.name ?? ''; },
		get spellTotals() { return spellTotals; },
		get spellsPerDayInfo() { return spellsPerDayInfo; },
		get totalMaxHP() { return totalMaxHP; },
		get skillTotals() { return skillTotals; },
	};
}

export type CharacterState = ReturnType<typeof createCharacterState>;