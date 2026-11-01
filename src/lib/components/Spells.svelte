<script lang="ts">
	import type { CharacterState } from '$lib/stores/character.svelte.ts';
	import { createDefaultSpell } from '$lib/utils/persistence';
	import { formatModifier } from '$lib/utils/math';
	import { magicSchools, castingTimePresets } from '$lib/data/spells';

	interface Props {
		character: CharacterState;
	}

	let { character }: Props = $props();

	const spellLevels: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	const CUSTOM_CASTING_TIME = '__custom__';

	function addSpell() {
		character.data.spells.push(createDefaultSpell());
	}

	function removeSpell(id: string) {
		const index = character.data.spells.findIndex((s) => s.id === id);
		if (index !== -1) character.data.spells.splice(index, 1);
	}

	function levelLabel(level: number): string {
		if (level === 0) return '0 (cantrip)';
		const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
		return `${level}${suffix}`;
	}
</script>

<div class="space-y-1.5">
	<!-- Spellcasting summary -->
	<div class="section-card overflow-hidden">
		<div class="section-header">✨ Spellcasting</div>
		<div class="p-1.5">
			<div class="grid grid-cols-5 gap-1">
				<div>
					<div class="stat-label">Casting Ability</div>
					<select class="grid-input" bind:value={character.data.spellcasting.ability}>
						<option value="auto">
							Auto{character.detectedCastingClassName ? ` (${character.detectedCastingClassName})` : ''}
						</option>
						<option value="int">Int</option>
						<option value="wis">Wis</option>
						<option value="cha">Cha</option>
					</select>
				</div>
				<div>
					<div class="stat-label">Ability Mod</div>
					<div class="readonly-field">{formatModifier(character.castingAbilityMod)}</div>
				</div>
				<div>
					<div class="stat-label">Caster Level</div>
					<div class="readonly-field text-lg font-bold text-burgundy">{character.casterLevel}</div>
				</div>
				<div>
					<div class="stat-label">Misc CL</div>
					<input type="number" class="grid-input" bind:value={character.data.spellcasting.miscCasterLevel} />
				</div>
				<div>
					<div class="stat-label">Concentration</div>
					<div class="readonly-field text-lg font-bold text-burgundy">{formatModifier(character.concentrationTotal)}</div>
				</div>
			</div>
			<div class="text-2xs text-ink-light italic mt-1">
				Auto picks the casting ability from your highest-level casting class (half casters count level − 3).
				Spell save DC = 10 + spell level + ability modifier; concentration checks roll d20
				+ {formatModifier(character.concentrationTotal)} (caster level + ability mod).
			</div>
		</div>
	</div>

	<!-- Spells per day -->
	<div class="section-card overflow-hidden">
		<div class="section-header">📅 Spells per Day</div>
		<div class="p-1.5">
			{#if !character.spellsPerDayInfo}
				<div class="text-xs text-ink-light italic text-center py-3">
					Add a casting class (e.g. Wizard) on the Main tab to see spells per day.
				</div>
			{:else if character.spellsPerDayInfo.levels.length === 0}
				<div class="text-xs text-ink-light italic text-center py-3">
					{character.spellsPerDayInfo.className} {character.spellsPerDayInfo.classLevel} cannot cast spells yet
					(half casters begin casting at 4th class level).
				</div>
			{:else}
				<div class="text-xs font-bold text-burgundy uppercase tracking-wider text-center mb-1">
					{character.spellsPerDayInfo.className} {character.spellsPerDayInfo.classLevel}
				</div>
				<div class="grid grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr] gap-0.5 text-[9px] font-bold text-center text-ink-light uppercase mb-0.5 px-1">
					<div class="text-left">Spell Level</div>
					<div>Known</div>
					<div>Base/Day</div>
					<div>Ability Bonus</div>
					<div>Total/Day</div>
					<div>Save DC</div>
				</div>
				<div class="divide-y divide-warm-200">
					{#each character.spellsPerDayInfo.levels as entry (entry.level)}
						<div class="grid grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr] gap-0.5 items-center text-xs px-1 even:bg-parchment-dark/40">
							<div class="text-ink font-bold text-left">{levelLabel(entry.level)}</div>
							<div class="readonly-field">{entry.known >= 0 ? entry.known : '—'}</div>
							<div class="readonly-field">{entry.atWill ? 'At will' : entry.base}</div>
							<div class="readonly-field">{!entry.atWill && entry.bonus > 0 ? `+${entry.bonus}` : '—'}</div>
							<div class="readonly-field font-bold text-burgundy">{entry.atWill ? 'At will' : entry.total}</div>
							<div class="readonly-field">{entry.saveDC}</div>
						</div>
					{/each}
				</div>
				<div class="grid grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr] gap-0.5 items-center text-xs px-1 pt-1 mt-1 border-t border-warm-300 font-bold">
					<div class="text-ink text-left uppercase text-[10px]">Total</div>
					<div></div>
					<div></div>
					<div></div>
					<div class="text-center text-burgundy">{character.spellsPerDayInfo.totalSlots}</div>
					<div></div>
				</div>
				<div class="text-2xs text-ink-light italic mt-1">
					Base slots from the official class table. A high casting ability grants +1 bonus slot per spell level
					from 1st up to your modifier ({formatModifier(character.castingAbilityMod)}). Spells Known applies to
					spontaneous casters — prepared casters choose from their full class list. Domain, specialization and
					other bonus slots are not included; only your highest-level casting class is shown.
				</div>
			{/if}
		</div>
	</div>

	<!-- Spell cards -->
	<div class="section-card overflow-hidden">
		<div class="section-header">📜 Spells</div>
		<div class="p-1.5">
			<div class="flex items-center justify-end mb-1">
				<button class="btn-primary" onclick={addSpell}>+ Add Spell</button>
			</div>
			{#if character.data.spells.length === 0}
				<div class="text-xs text-ink-light italic text-center py-3">
					No spells yet. Click "+ Add Spell" to start your spellbook.
				</div>
			{/if}
			<div class="space-y-1.5">
				{#each character.data.spells as spell, i (spell.id)}
					{@const totals = character.spellTotals[i]}
					<div class="section-card overflow-hidden">
						<div class="flex items-center justify-between px-1.5 py-0.5 bg-warm-100 border-b border-warm-200">
							<span class="text-xs font-bold text-burgundy uppercase tracking-wider truncate">
								✨ {spell.name || `Spell ${i + 1}`}
							</span>
							<button class="btn-danger text-xs py-0.5 px-1.5" onclick={() => removeSpell(spell.id)}>✕ Remove</button>
						</div>
						<!-- Save DC, concentration DC & total range, emphasized -->
						<div class="px-1.5 py-1 border-b border-warm-200 bg-parchment-dark/40 grid grid-cols-3 gap-1.5 text-center">
							<div>
								<div class="text-[9px] font-semibold text-ink-light uppercase tracking-wider">Save DC</div>
								<div class="text-lg font-bold text-burgundy leading-tight">{totals?.saveDC ?? '—'}</div>
							</div>
							<div class="border-l border-warm-200">
								<div class="text-[9px] font-semibold text-ink-light uppercase tracking-wider">Concentration DC (Defensive)</div>
								<div class="text-lg font-bold text-burgundy leading-tight">{totals?.concentrationDC ?? '—'}</div>
							</div>
							<div class="border-l border-warm-200">
								<div class="text-[9px] font-semibold text-ink-light uppercase tracking-wider">Total Range (m)</div>
								<div class="text-lg font-bold text-burgundy leading-tight">{totals?.totalRange ?? '—'}</div>
							</div>
						</div>
						<div class="p-1.5">
							<!-- Identity row -->
							<div class="grid grid-cols-7 gap-1.5 text-xs">
								<div class="col-span-2">
									<div class="stat-label">Spell Name</div>
									<input type="text" class="grid-input" placeholder="Fireball" bind:value={spell.name} />
								</div>
								<div>
									<div class="stat-label">Level</div>
									<select class="grid-input" bind:value={spell.level}>
										{#each spellLevels as lvl}
											<option value={lvl}>{lvl === 0 ? '0 (cantrip)' : lvl}</option>
										{/each}
									</select>
								</div>
								<div class="col-span-2">
									<div class="stat-label">School</div>
									<select class="grid-input" bind:value={spell.school}>
										<option value="">— School —</option>
										{#each magicSchools as school}
											<option value={school}>{school}</option>
										{/each}
									</select>
								</div>
								<div class="col-span-2">
									<div class="stat-label">Subschool / Descriptors</div>
									<input type="text" class="grid-input" placeholder="fire" bind:value={spell.subschoolDescriptors} />
								</div>
							</div>
							<!-- Casting row -->
							<div class="grid grid-cols-6 gap-1.5 text-xs mt-1">
								<div class="col-span-2">
									<div class="stat-label">Casting Time</div>
									<select
										class="grid-input"
										value={castingTimePresets.includes(spell.castingTime) ? spell.castingTime : CUSTOM_CASTING_TIME}
										onchange={(e) => {
											const value = e.currentTarget.value;
											spell.castingTime = value === CUSTOM_CASTING_TIME ? '' : value;
										}}
									>
										{#each castingTimePresets as ct}
											<option value={ct}>{ct}</option>
										{/each}
										<option value={CUSTOM_CASTING_TIME}>Custom…</option>
									</select>
									{#if !castingTimePresets.includes(spell.castingTime)}
										<input
											type="text"
											class="grid-input mt-1"
											placeholder="e.g. 30 minutes"
											bind:value={spell.castingTime}
										/>
									{/if}
								</div>
								<div>
									<div class="stat-label">Range/Level (m)</div>
									<input type="number" class="grid-input" min="0" bind:value={spell.rangePerLevel} />
								</div>
								<div>
									<div class="stat-label">Raw Range (m)</div>
									<input type="number" class="grid-input" min="0" bind:value={spell.rangeBase} />
								</div>
								<div class="col-span-2">
									<div class="stat-label">Duration</div>
									<input type="text" class="grid-input" placeholder="Instantaneous" bind:value={spell.duration} />
								</div>
							</div>
							<!-- Targets row -->
							<div class="grid grid-cols-7 gap-1.5 text-xs mt-1">
								<div class="col-span-2">
									<div class="stat-label">Components</div>
									<input type="text" class="grid-input" placeholder="V, S, M (…)" bind:value={spell.components} />
								</div>
								<div class="col-span-2">
									<div class="stat-label">Targets</div>
									<input type="text" class="grid-input" placeholder="One creature" bind:value={spell.targets} />
								</div>
								<div>
									<div class="stat-label">Area</div>
									<input type="text" class="grid-input" placeholder="20-ft. radius" bind:value={spell.area} />
								</div>
								<div class="col-span-2">
									<div class="stat-label">Effect</div>
									<input type="text" class="grid-input" placeholder="Ray" bind:value={spell.effect} />
								</div>
							</div>
							<!-- Saving throw & description row -->
							<div class="grid grid-cols-7 gap-1.5 text-xs mt-1">
								<div class="col-span-2">
									<div class="stat-label">Saving Throw</div>
									<input type="text" class="grid-input" placeholder="Reflex half" bind:value={spell.savingThrow} />
								</div>
								<div>
									<div class="stat-label">Spell Res.</div>
									<select class="grid-input" bind:value={spell.spellResistance}>
										<option value={false}>No</option>
										<option value={true}>Yes</option>
									</select>
								</div>
								<div class="col-span-4">
									<div class="stat-label">Description</div>
									<textarea class="grid-input text-left" rows="3" placeholder="Spell effect…" bind:value={spell.description}></textarea>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="text-2xs text-ink-light italic mt-1">
				Save DC = 10 + spell level + casting ability modifier. Casting defensively requires a concentration check
				(d20 + caster level + ability mod) against DC 15 + 2 × spell level. Total range = raw range + range
				increase per level × caster level.
			</div>
		</div>
	</div>
</div>
