import { calcModifier, calcBAB, calcCMB, calcCMD, calcSave,
	calcTotalAC,
	formatAttackLine,
	formatDamage,
	calcMeleeStrengthMultiplier
} from '$lib/utils/math';
import { createDefaultCharacter, type CharacterData } from '$lib/utils/persistence';
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
		get totalMaxHP() { return totalMaxHP; },
		get skillTotals() { return skillTotals; },
	};
}

export type CharacterState = ReturnType<typeof createCharacterState>;