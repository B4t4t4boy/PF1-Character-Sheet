<script lang="ts">
	import type { CharacterState } from '$lib/stores/character.svelte.ts';
	import { classGroups, classNames, getClassPreset } from '$lib/data/classes';

	interface Props {
		character: CharacterState;
	}

	let { character }: Props = $props();

	const CUSTOM = '__custom__';

	/** A class row is "custom" when its name is not one of the known presets. */
	function isCustom(name: string): boolean {
		return name !== '' && !classNames.includes(name);
	}

	function addClass() {
		character.data.classes.push({
			name: '',
			level: 1,
			hdSize: 10,
			babProgression: 'medium',
			fortProgression: true,
			refProgression: false,
			willProgression: false,
			skillPointsPerLevel: 4
		});
	}

	function removeClass(index: number) {
		character.data.classes.splice(index, 1);
	}

	/** Applies the chosen class: sets the name and fills in the class specs. */
	function selectClass(index: number, value: string) {
		const cls = character.data.classes[index];
		if (value === CUSTOM) {
			cls.name = 'Custom Class';
			return;
		}
		const preset = getClassPreset(value);
		cls.name = value;
		if (preset) {
			cls.hdSize = preset.hdSize;
			cls.babProgression = preset.babProgression;
			cls.fortProgression = preset.fortProgression;
			cls.refProgression = preset.refProgression;
			cls.willProgression = preset.willProgression;
			cls.skillPointsPerLevel = preset.skillPointsPerLevel;
		}
	}
</script>

<div class="section-card overflow-hidden">
	<div class="section-header">🎓 Classes</div>
	<div class="p-1.5">
		<div class="flex items-center justify-end mb-1">
			<button class="btn-primary" onclick={addClass}>+ Add Class</button>
		</div>
		{#if character.data.classes.length === 0}
			<div class="text-xs text-ink-light italic text-center py-3">No classes added yet. Click "+ Add Class" to begin.</div>
		{/if}
		<div class="space-y-1.5">
			{#each character.data.classes as cls, i}
				<div class="section-card overflow-hidden">
					<div class="flex items-center justify-between px-1.5 py-0.5 bg-warm-100 border-b border-warm-200">
						<span class="text-xs font-bold text-burgundy uppercase tracking-wider">🎓 Class {i + 1}</span>
						<button class="btn-danger text-xs py-0.5 px-1.5" onclick={() => removeClass(i)}>✕ Remove</button>
					</div>
					<div class="p-1.5">
						<div class="grid grid-cols-4 gap-1.5 text-xs">
							<div>
								<div class="stat-label">Class</div>
								<select
									class="grid-input"
									value={isCustom(cls.name) ? CUSTOM : cls.name}
									onchange={(e) => selectClass(i, e.currentTarget.value)}
								>
									<option value="">— Select class —</option>
									{#each classGroups as group}
										<optgroup label={group.label}>
											{#each group.classes as preset}
												<option value={preset.name}>{preset.name}</option>
											{/each}
										</optgroup>
									{/each}
									<option value={CUSTOM}>Custom…</option>
								</select>
								{#if isCustom(cls.name)}
									<input
										type="text"
										class="grid-input mt-1"
										placeholder="Custom class name"
										bind:value={cls.name}
									/>
								{/if}
							</div>
							<div>
								<div class="stat-label">Level</div>
								<input type="number" class="grid-input" bind:value={cls.level} min="1" max="20" />
							</div>
							<div>
								<div class="stat-label">HD Size</div>
								<select class="grid-input" bind:value={cls.hdSize}>
									<option value={6}>d6</option>
									<option value={8}>d8</option>
									<option value={10}>d10</option>
									<option value={12}>d12</option>
								</select>
							</div>
							<div>
								<div class="stat-label">BAB</div>
								<select class="grid-input" bind:value={cls.babProgression}>
									<option value="fast">Fast</option>
									<option value="medium">Medium</option>
									<option value="slow">Slow</option>
								</select>
							</div>
							<div>
								<div class="stat-label">Fort Save</div>
								<select class="grid-input" bind:value={cls.fortProgression}>
									<option value={true}>Good</option>
									<option value={false}>Poor</option>
								</select>
							</div>
							<div>
								<div class="stat-label">Ref Save</div>
								<select class="grid-input" bind:value={cls.refProgression}>
									<option value={true}>Good</option>
									<option value={false}>Poor</option>
								</select>
							</div>
							<div>
								<div class="stat-label">Will Save</div>
								<select class="grid-input" bind:value={cls.willProgression}>
									<option value={true}>Good</option>
									<option value={false}>Poor</option>
								</select>
							</div>
							<div>
								<div class="stat-label">Skill Pts/Lvl</div>
								<input type="number" class="grid-input" bind:value={cls.skillPointsPerLevel} min="0" max="10" />
							</div>
						</div>
						<div class="text-2xs text-ink-light italic mt-1">
							Picking a class fills in its hit die, BAB and saves automatically — you can still tweak them.
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
