<script lang="ts">
	import type { CharacterState } from '$lib/stores/character.svelte.ts';
	import { createDefaultWeapon, type WeaponData } from '$lib/utils/persistence';
	import { formatModifier } from '$lib/utils/math';

	interface Props {
		character: CharacterState;
	}

	let { character }: Props = $props();

	function addWeapon(attackType: 'melee' | 'ranged') {
		character.data.weapons.push(createDefaultWeapon(attackType));
	}

	function removeWeapon(id: string) {
		const index = character.data.weapons.findIndex((w) => w.id === id);
		if (index !== -1) character.data.weapons.splice(index, 1);
	}

	/**
	 * Switching a weapon between melee and ranged also swaps the fields that
	 * default differently per attack type (finesse, thrown, composite and other
	 * exceptions stay fully user-editable).
	 */
	function changeAttackType(weapon: WeaponData, value: string) {
		const attackType: 'melee' | 'ranged' = value === 'ranged' ? 'ranged' : 'melee';
		if (weapon.attackType === attackType) return;
		weapon.attackType = attackType;
		if (attackType === 'ranged') {
			if (weapon.attackAbility === 'str') weapon.attackAbility = 'dex';
			if (weapon.damageAbility === 'str') weapon.damageAbility = 'none';
			if (weapon.rangeIncrement === 0) weapon.rangeIncrement = 30;
		} else {
			if (weapon.attackAbility === 'dex') weapon.attackAbility = 'str';
			if (weapon.damageAbility === 'none') weapon.damageAbility = 'str';
		}
	}
</script>

<div class="space-y-1.5">
	<!-- Basic attack bonuses (no weapon needed) -->
	<div class="section-card overflow-hidden">
		<div class="section-header">⚔️ Basic Attacks</div>
		<div class="p-1.5">
			<div class="grid grid-cols-4 gap-1">
				<div>
					<div class="stat-label">Melee (BAB + Str)</div>
					<div class="readonly-field text-lg font-bold text-burgundy">{character.meleeAttackLine}</div>
				</div>
				<div>
					<div class="stat-label">Ranged (BAB + Dex)</div>
					<div class="readonly-field text-lg font-bold text-burgundy">{character.rangedAttackLine}</div>
				</div>
				<div>
					<div class="stat-label">BAB</div>
					<div class="readonly-field">{character.totalBAB}</div>
				</div>
				<div>
					<div class="stat-label">Str / Dex Mod</div>
					<div class="readonly-field">{formatModifier(character.strMod)} / {formatModifier(character.dexMod)}</div>
				</div>
			</div>
			<div class="text-2xs text-ink-light italic mt-1">
				Each line lists the iterative attacks available on a full attack (one extra attack per 5 BAB at a
				cumulative -5). Melee adds Strength, ranged adds Dexterity; weapon-specific options like finesse or
				thrown weapons are configured per weapon below.
			</div>
		</div>
	</div>

	<!-- Weapon attack routines -->
	<div class="section-card overflow-hidden">
		<div class="section-header">🗡️ Weapons</div>
		<div class="p-1.5">
			<div class="flex items-center justify-end gap-1 mb-1">
				<button class="btn-primary" onclick={() => addWeapon('melee')}>+ Add Melee Weapon</button>
				<button class="btn-primary" onclick={() => addWeapon('ranged')}>+ Add Ranged Weapon</button>
			</div>
			{#if character.data.weapons.length === 0}
				<div class="text-xs text-ink-light italic text-center py-3">
					No weapons yet. Click "+ Add Melee Weapon" or "+ Add Ranged Weapon" to build your attack routine.
				</div>
			{/if}
			<div class="space-y-1.5">
				{#each character.data.weapons as weapon, i (weapon.id)}
					{@const attack = character.weaponAttacks[i]}
					<div class="section-card overflow-hidden">
						<div class="flex items-center justify-between px-1.5 py-0.5 bg-warm-100 border-b border-warm-200">
							<span class="text-xs font-bold text-burgundy uppercase tracking-wider truncate">
								{weapon.attackType === 'melee' ? '🗡️' : '🏹'}
								{weapon.name || `${weapon.attackType} weapon ${i + 1}`}
							</span>
							<button class="btn-danger text-xs py-0.5 px-1.5" onclick={() => removeWeapon(weapon.id)}>✕ Remove</button>
						</div>
						<!-- Total attack bonus & damage, emphasized -->
						<div class="px-1.5 py-1 border-b border-warm-200 bg-parchment-dark/40 grid grid-cols-2 gap-1.5 text-center">
							<div>
								<div class="text-[9px] font-semibold text-ink-light uppercase tracking-wider">Total Attack Bonus</div>
								<div class="text-lg font-bold text-burgundy leading-tight">{attack?.attackLine ?? '—'}</div>
							</div>
							<div class="border-l border-warm-200">
								<div class="text-[9px] font-semibold text-ink-light uppercase tracking-wider">Total Damage</div>
								<div class="text-lg font-bold text-burgundy leading-tight">{attack?.damage ?? '—'}</div>
							</div>
						</div>
						<div class="p-1.5">
							<!-- Attack row -->
							<div class="grid grid-cols-6 gap-1.5 text-xs">
								<div class="col-span-2">
									<div class="stat-label">Weapon Name</div>
									<input
										type="text"
										class="grid-input"
										placeholder={weapon.attackType === 'melee' ? 'Longsword' : 'Longbow'}
										bind:value={weapon.name}
									/>
								</div>
								<div>
									<div class="stat-label">Type</div>
									<select
										class="grid-input"
										value={weapon.attackType}
										onchange={(e) => changeAttackType(weapon, e.currentTarget.value)}
									>
										<option value="melee">Melee</option>
										<option value="ranged">Ranged</option>
									</select>
								</div>
								<div>
									<div class="stat-label">Atk Ability</div>
									<select class="grid-input" bind:value={weapon.attackAbility}>
										<option value="str">Str</option>
										<option value="dex">Dex</option>
									</select>
								</div>
								<div>
									<div class="stat-label">Enhance</div>
									<input type="number" class="grid-input" bind:value={weapon.enhancement} min="0" max="10" />
								</div>
								<div>
									<div class="stat-label">Misc Atk</div>
									<input type="number" class="grid-input" bind:value={weapon.miscAttack} />
								</div>
							</div>
							<!-- Damage & critical row -->
							<div class="grid grid-cols-6 gap-1.5 text-xs mt-1">
								<div>
									<div class="stat-label">Damage Dice</div>
									<input type="text" class="grid-input" placeholder="1d8" bind:value={weapon.damageDice} />
								</div>
								<div>
									<div class="stat-label">Dmg Ability</div>
									<select class="grid-input" bind:value={weapon.damageAbility}>
										<option value="str">Str</option>
										<option value="dex">Dex</option>
										<option value="none">None</option>
									</select>
								</div>
								<div>
									<div class="stat-label">Grip (Str ×)</div>
									{#if weapon.attackType === 'melee'}
										<select class="grid-input" bind:value={weapon.handedness}>
											<option value="one-handed">1-Hand ×1</option>
											<option value="two-handed">2-Hand ×1½</option>
											<option value="off-hand">Off-Hand ×½</option>
										</select>
									{:else}
										<div class="readonly-field">—</div>
									{/if}
								</div>
								<div>
									<div class="stat-label">Misc Dmg</div>
									<input type="number" class="grid-input" bind:value={weapon.miscDamage} />
								</div>
								<div>
									<div class="stat-label">Critical</div>
									<input type="text" class="grid-input" placeholder="20/x2" bind:value={weapon.critical} />
								</div>
								<div>
									<div class="stat-label">Range Inc. (m)</div>
									<input type="number" class="grid-input" min="0" bind:value={weapon.rangeIncrement} />
								</div>
							</div>
							<!-- Ammunition & notes row -->
							<div class="grid grid-cols-7 gap-1.5 text-xs mt-1">
								{#if weapon.attackType === 'ranged'}
									<div>
										<div class="stat-label">Ammunition</div>
										<input type="text" class="grid-input" placeholder="Arrows (20)" bind:value={weapon.ammunition} />
									</div>
								{/if}
								<div class={weapon.attackType === 'ranged' ? 'col-span-6' : 'col-span-7'}>
									<div class="stat-label">Notes</div>
									<input
										type="text"
										class="grid-input"
										placeholder="Special material, thrown, composite, feats applied…"
										bind:value={weapon.notes}
									/>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="text-2xs text-ink-light italic mt-1">
				Attack = BAB + ability + enhancement + misc, with iterative attacks per 5 BAB. Damage = dice + ability
				(×1½ two-handed, ×½ off-hand) + enhancement + misc. Ranged attacks take a cumulative -2 per range
				increment beyond the first.
			</div>
		</div>
	</div>
</div>
