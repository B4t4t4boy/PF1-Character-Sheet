<script lang="ts">
	import 'virtual:uno.css';
	import '../styles/print.css';
	import { createCharacterState } from '$lib/stores/character.svelte.ts';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Header from '$lib/components/Header.svelte';
	import AbilityScores from '$lib/components/AbilityScores.svelte';
	import Defenses from '$lib/components/Defenses.svelte';
	import Classes from '$lib/components/Classes.svelte';
	import Skills from '$lib/components/Skills.svelte';
	import Combat from '$lib/components/Combat.svelte';
	import Spells from '$lib/components/Spells.svelte';

	let character = $state(createCharacterState());
	let currentTab = $state('main');

	const tabs = [
		{ id: 'main', label: 'Main' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'combat', label: 'Combat' },
		{ id: 'spells', label: 'Spells' },
		{ id: 'gear', label: 'Gear' },
	];

	let { children } = $props();
</script>

{@render children()}

<div class="min-h-screen bg-parchment font-sans text-ink">
	<Toolbar {character} />

	<!-- Tab navigation -->
	<div class="flex gap-0 px-1.5 pt-1.5 bg-warm-200 border-b border-warm-300">
		{#each tabs as tab}
			<button
				class={tab.id === currentTab ? 'tab-active' : 'tab-inactive'}
				onclick={() => currentTab = tab.id}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Main content area -->
	<div class="p-1.5 print:p-0 print:m-0">
		{#if currentTab === 'main'}
			<div class="space-y-1.5">
				<Header {character} />
				<AbilityScores {character} />
				<Defenses {character} />
				<Classes {character} />
			</div>
		{:else if currentTab === 'skills'}
			<Skills {character} />
		{:else if currentTab === 'combat'}
			<Combat {character} />
		{:else if currentTab === 'spells'}
			<Spells {character} />
		{:else if currentTab === 'gear'}
			<div class="section-card p-3 text-sm text-ink-light italic">Gear tab (inventory, equipment) — coming soon</div>
		{/if}
	</div>
</div>
