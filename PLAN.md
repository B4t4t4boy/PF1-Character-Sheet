# Character Sheet Completion Plan

## 1. Purpose and scope

**Status:** Planning only; no application implementation is part of this document.

This roadmap is based on the current Svelte 5 / SvelteKit static application, its character model, calculations, components, IndexedDB persistence, print styles, and GitHub Pages workflow.

**Provisional target:** A reliable, local-first Pathfinder 1e character sheet for creating, editing, saving, restoring, printing, and playing characters. Preserve the existing stack and dense sheet presentation.

“Fully functional” means that all advertised sections work, supported calculations are correct and explainable, character data survives normal use, and unsupported rules can be represented through clearly labeled manual entries or overrides. It does not mean implementing every published rule or a complete automated character builder.

### Edition: Pathfinder 1e

This project targets **Pathfinder 1e** exclusively: BAB, CMB/CMD, good/poor saves, skill ranks, and PF1e class presets. Pathfinder 2e is out of scope; do not introduce proficiency ranks, three-action combat, degrees of success, ancestry/background/class boosts, or archetype-based multiclassing.

- [x] Confirm PF1e as the supported edition.
- [x] Align the repository/deployment name (`PF1-Character-Sheet`) and product documentation with PF1e.
- [ ] Treat all rules-specific tasks below as PF1e-only; do not add dual-edition support.

## 2. Current state and verified gaps

| Area | Current implementation | Gap or risk |
| --- | --- | --- |
| Stack | Svelte 5 runes, TypeScript, UnoCSS, Dexie, static adapter | Suitable foundation; no rewrite needed |
| Main sheet | Identity, abilities, classes, HP, AC, saves, initiative, BAB/CMB/CMD | Several calculations and bindings are incomplete |
| Class selection | 11 core and 7 additional base-class presets; auto-filled specs; custom entries | Partial catalog, no source metadata, class-skill lists, or advancement history |
| Skills | 35 definitions, ranks, manual class-skill flags, miscellaneous modifiers | Wrong rank-cap helper, hardcoded UI cap, ACP always zero, no rank budget or specialties |
| Combat / Spells / Gear | Tabs exist in `src/routes/+layout.svelte` | Placeholder content only |
| Other sheet content | Feats, special abilities, notes exist in the data model | No editing/display interface; several play resources are absent |
| Persistence | Save/list/load/delete helpers exist | Load button only alerts names; no usable load/delete UI or active character identity |
| Import/export | Raw JSON export and parsing | No runtime validation, schema version, migration, or safe replacement |
| Printing | `window.print()` and print CSS | Inactive tabs are unmounted, so only the active section can print |
| Offline | IndexedDB local storage | No tracked service worker or web app manifest; cold offline app loading is not established |
| Navigation | Local tab state, placeholder route pages | `/skills/` does not select Skills; browser history and tabs are disconnected |
| Quality | Build/check scripts and Pages deployment | No tracked tests/test scripts; deployment runs build but not type checks or tests |

### Diagnostic baseline

- The production build succeeded in the preceding implementation step. That is not evidence of correct runtime behavior.
- `npm run check` was rerun during this review and failed with **9 errors and 1 warning**:
  - Missing Node type support in `vite.config.ts`.
  - Seven aliased imports ending in `.svelte.ts` conflict with the current TypeScript emit configuration.
  - Missing `node` type definition warning.
- This review inspected source and diagnostics; it did not perform a complete browser interaction, IndexedDB failure, accessibility, or print audit.
- Existing uncommitted class-dropdown changes were present before this planning task and are included in the assessment.

### Specific correctness issues to address

1. **AC field semantics:** `Defenses.svelte` labels `data.ac.total` as Armor, while the store subtracts 10 and feeds it into the armor contribution. Entering an armor bonus does not mean what the label implies. Shield, natural armor, and deflection inputs are disabled.
2. **Flat-footed/touch AC:** Flat-footed AC always subtracts Dexterity, incorrectly removing negative Dexterity penalties. Touch AC only uses 10 + Dexterity, omitting other applicable modifiers.
3. **Save editing:** Magic inputs bind to temporary `sv` objects constructed for rendering, not to the persisted save fields. Miscellaneous and temporary save fields are omitted from displayed totals.
4. **Multiclass HP:** The store grants a full hit die at the first level of every class rather than only the first character level. Rolled HP, minimum gains, favored-class choices, and bonus sources are not modeled. `calcHP` duplicates related logic.
5. **Skills:** `skillRankCap` returns level + 3, a D&D 3.5-style rule, not the PF1e character-level cap. The UI hardcodes 23; HTML constraints alone do not validate persisted values. Trained-only metadata is not exposed and ACP is a zero placeholder.
6. **Size:** Selecting size does not affect AC, attacks, CMB/CMD, or relevant skills. These systems require different size tables.
7. **Numeric input:** Some handlers use `parseInt(...) || default`, making zero indistinguishable from missing input; clearing other bound numeric fields can introduce invalid state.
8. **Persistence identity:** Saving by name can overwrite a different same-name character; renaming can create an unintended new entry.
9. **Import safety:** `JSON.parse` followed by a type assertion and shallow `Object.assign` permits incomplete or malformed nested data and retains unspecified old fields.
10. **Serialization risk:** Reactive state is passed directly to Dexie without an explicit plain-data snapshot. Reproduce and guard against proxy/structured-clone failures; do not assume saving works because it compiles.
11. **Custom classes:** Custom mode is inferred from the editable name. Clearing that name hides the input; entering a preset name exits custom mode without necessarily applying its specs.

## 3. Release boundaries and architecture

### Required for the first complete release

- [ ] Support the chosen edition and document the supported rules/catalog scope.
- [ ] Complete Main, Skills, Combat, Spells, Gear, feats/features, resources, and notes.
- [ ] Support multiclass characters and custom content without destructive auto-corrections.
- [ ] Make New, Save, Load, Rename, Duplicate, Delete, Import, Export, and Print usable without the console.
- [ ] Provide versioned, validated storage with recovery and backup.
- [ ] Print the whole character and reopen previously cached characters/app offline.
- [ ] Pass automated correctness checks and browser acceptance scenarios.

### Architecture direction

- Keep a single shared reactive character state across sections.
- Separate persisted **inputs** from calculated **outputs** and application UI state.
- Move domain types/validation out of the persistence utility as the schema grows.
- Keep rules calculations in pure, independently testable modules; compose them through Svelte derived state.
- Use stable IDs for characters, class definitions, and repeated entries rather than display names or array positions as identity.
- Store explicit overrides separately from calculated values, with a reason/source and reset action.
- Use a shared modifier representation for source, target, bonus type, value, activation, and optional conditions. Apply PF1e stacking rules deliberately rather than adding every bonus blindly.
- Package the supported reference data locally. Runtime editing, calculations, and saved characters must not depend on live wiki access.
- Prefer incremental migrations and small vertical slices over a large rewrite.

### Deferred unless explicitly requested

Accounts/cloud sync, collaboration, a virtual tabletop, exhaustive feat prerequisite enforcement, automatic application of every spell/feat, full compendium scraping, dice animation, companions as independent sheets, desktop wrappers, and dual-edition support. Manual records and overrides should cover unsupported character options.

## 4. Prioritized implementation roadmap

Priority guide: **P0** = foundation/data safety, **P1** = playable completeness, **P2** = release readiness.

### Phase 0 — Rules and content contract (P0)

**Dependencies:** None.

- [ ] Resolve the edition decision above.
- [ ] Define core vs. supplemental classes, standard vs. unchained variants, supported levels, multiclass rounding, and optional fractional progression.
- [ ] Specify HP generation policy, favored-class handling, skill-rank allocation, and manual override behavior.
- [ ] Define spellcasting support: prepared, spontaneous, multiple casting classes, and manual exceptions.
- [ ] Verify class data against edition-specific authoritative rules; attach source/book/URL metadata and variant IDs. The current preset list is not a complete catalog.
- [ ] Review content licensing/attribution before redistributing descriptions or bulk reference data; do not assume a wiki link grants redistribution rights.

**Acceptance:** An explicit rules-support contract, source policy, and small set of independently calculated reference characters exist.

### Phase 1 — Tooling and regression safety (P0)

**Dependencies:** None for tooling; Phase 0 for expected rules fixtures.

**Primary files:** `package.json`, `tsconfig.json`, Vite/Svelte configuration, tests, CI workflow.

- [ ] Resolve all current Svelte/TypeScript errors and warnings, including Node types and alias import conventions.
- [ ] Pin/document the supported Node version and verify reproducibility using `npm ci`.
- [ ] Investigate the OXC alias/external stub; retain it only if its necessity and portability are verified.
- [ ] Add formatting/linting and unit/component/browser testing, e.g. Vitest, Svelte Testing Library, and Playwright.
- [ ] Add tests for known bugs before fixes. Use independent rule expectations, not outputs copied from the current implementation.
- [ ] Add pull-request checks for type checking, tests, and production build before deployment.
- [ ] Review unused dependencies and configuration workarounds without changing frameworks.

**Acceptance:** A clean checkout passes the agreed quality commands; CI blocks failing changes; regression tests cover the initial critical calculations.

### Phase 2 — Validated character model and safe persistence (P0)

**Dependencies:** Phases 0–1.

**Primary files:** `src/lib/utils/persistence.ts`, `src/lib/db.ts`, store, `Toolbar.svelte`; new domain/schema and character-library modules.

- [ ] Introduce a versioned document envelope with edition, schema version, character identity, and timestamps.
- [ ] Add stable IDs to repeated records and track the active saved character independently of its name.
- [ ] Define runtime validation for types, enums, finite numbers, valid ranges, nested objects, and collection/file limits.
- [ ] Normalize empty form inputs deliberately; allow legitimate negative HP and modifiers.
- [ ] Remove ambiguity between inputs and derived totals, including legacy `hp.max`, AC totals, save bases/abilities, initiative Dexterity, BAB/CMB/CMD, and skill ability values.
- [ ] Implement migrations from existing unversioned JSON and IndexedDB data. Preserve originals and record warnings for ambiguous legacy AC/HP rather than guessing silently.
- [ ] Serialize a plain snapshot before IndexedDB writes; validate loaded data before replacing current state.
- [ ] Implement a character library with load, rename, duplicate, delete confirmation, and clear empty/loading/error states.
- [ ] Make import transactional from the user's perspective: validate/migrate first, then replace with a complete normalized document; failure must leave the current character intact.
- [ ] Distinguish importing a copy from replacing the active character.
- [ ] Add dirty-state handling for New, Load, Import, and navigation; debounce autosave with visible status and explicit save/backup options.
- [ ] Restore the last active character or recoverable draft on reload.
- [ ] Handle quota/permission/unavailable-storage errors and multi-tab conflicts without falsely reporting success.

**Acceptance:** Two same-name characters remain distinct; rename preserves identity; valid legacy data migrates; malformed imports cause no state loss; reload/load/export round trips preserve all editable fields; storage failures are actionable.

### Phase 3 — Correct main-sheet calculations (P0)

**Dependencies:** Phases 0–2.

**Primary files:** `math.ts`, store, `AbilityScores.svelte`, `Defenses.svelte`, `Header.svelte`, class data/component.

- [ ] Centralize numeric validation and fix temporary-object save bindings.
- [ ] Derive total level and class summary from class entries instead of maintaining conflicting free-text totals.
- [ ] Verify class BAB and save progressions, multiclass rounding, and variant behavior.
- [ ] Replace the ambiguous AC fields with explicit armor, shield, natural armor, deflection, size, dodge, Dexterity cap, and miscellaneous contributions.
- [ ] Calculate normal, touch, and flat-footed AC from applicable contributions; retain negative Dexterity penalties and handle documented exceptions/overrides.
- [ ] Include magic, miscellaneous, and temporary modifiers in saves, with visible breakdowns.
- [ ] Apply the correct size modifiers to attack/AC, maneuvers, and relevant skills.
- [ ] Record HP gains in character-level order, supporting the chosen rolled/fixed policy, minimum gains, Constitution changes, favored-class bonuses, temporary HP, and explicit adjustments.
- [ ] Define behavior for zero classes, class removal, and level decreases; do not erase unrelated data or silently heal current HP.
- [ ] Add base/effective ability distinctions where needed for equipment, temporary effects, damage, and drain.
- [ ] Expose movement speeds, senses, languages, XP/advancement policy, and defensive traits.
- [ ] Give custom class selection explicit identity/mode so editing a name cannot switch rules accidentally.
- [ ] Add formula/source breakdowns and labeled overrides for derived statistics.

**Acceptance:** Reference single-class and multiclass characters match manual calculations. For example, a normal PF1e level-1 Fighter with Dexterity 14 and +4 armor has AC 16, touch 12, flat-footed 14 before other modifiers; a Dexterity penalty remains when flat-footed. Saving-throw edits survive export/reload.

### Phase 4 — Skills and advancement (P1)

**Dependencies:** Phase 3; equipment-driven ACP is completed with Phase 5.

**Primary files:** skills definitions/component, class definitions, rules/store modules.

- [ ] Use total character level as the PF1e skill-rank cap and enforce it at validation boundaries.
- [ ] Track earned, allocated, and remaining ranks with Intelligence and supported bonus sources.
- [ ] Derive class-skill availability from all class entries, with manual additions/removals for custom rules.
- [ ] Apply the +3 class-skill bonus only with at least one rank; do not grant ranks automatically.
- [ ] Show trained-only restrictions and applicable exceptions clearly.
- [ ] Connect ACP, armor proficiency, encumbrance, racial/size, and temporary modifiers.
- [ ] Support named Craft, Perform, and Profession specialties without name collisions.
- [ ] Warn about overspending or invalid advancement after class/level changes; preserve data pending user resolution.
- [ ] Consolidate duplicated left/right row markup into an accessible reusable presentation.

**Acceptance:** A level-1 character cannot silently store four ranks in a skill; multiclass class skills work; training warnings, ACP, and allocation totals update correctly.

### Phase 5 — Gear, armor, and combat (P1)

**Dependencies:** Phases 2–3; integrates with Phase 4.

**Primary files:** replace Gear/Combat placeholders; extend inventory/weapons models and rules.

Implement this as an equipment-to-combat vertical slice:

- [ ] Add inventory CRUD with stable IDs, quantities, per-unit weight, containers/location, notes, equipped/carried state, charges, and currency.
- [ ] Calculate carried weight and PF1e encumbrance from Strength and applicable size/body-plan rules; support explicit exceptions such as extradimensional containers.
- [ ] Add equipped armor/shields with AC contribution, max Dexterity, ACP, spell failure, speed impact, proficiency, and enhancement.
- [ ] Wire equipment/encumbrance into defenses, skills, and speed using the appropriate combination rules.
- [ ] Add weapon CRUD with melee/ranged classification, proficiency, attack ability, damage dice/ability, enhancement, critical range/multiplier, range increment, ammunition, and notes.
- [ ] Derive attack bonuses, iterative attacks, and damage modifiers, including supported off-hand/two-handed/Strength exceptions.
- [ ] Provide manual attack routines for natural attacks, flurry, special abilities, and unsupported exceptions rather than misleading automation.
- [ ] Add damage/healing, temporary/nonlethal HP, ammunition consumption, condition tracking, resistances, immunities, DR, and SR.
- [ ] Make equipment/condition toggles reversible and show their calculation effects.

**Acceptance:** Equipping armor updates AC/ACP/speed; inventory weight updates encumbrance; a supported weapon displays correct attacks and damage; consumption and combat resources persist without affecting another row.

### Phase 6 — Feats, features, and play resources (P1)

**Dependencies:** Phases 2–3; shared modifier support from Phase 5 as needed.

- [ ] Expose existing feats, special abilities, and notes through editable sections or a Features tab.
- [ ] Support source, description, prerequisites/notes, acquisition level, and enabled state.
- [ ] Track limited-use resources such as rage rounds, bardic performance, channel energy, and item charges.
- [ ] Associate supported effects with the shared modifier system; clearly mark descriptive-only abilities.
- [ ] Add racial traits, traits/drawbacks where supported, proficiencies, and favored-class choices.
- [ ] Provide rest/reset actions with a preview or confirmation; reset only eligible resources.
- [ ] Support biography, campaign notes, and free-form companion/familiar notes.
- [ ] Distinguish build/level-up edits from in-session resource changes; guide advancement without requiring an exhaustive rules engine.

**Acceptance:** A non-spellcaster can record and use their relevant features during a session; toggles and rests are reversible or confirmed and do not overwrite unrelated resources.

### Phase 7 — Spellcasting (P1)

**Dependencies:** Phases 2–3 and shared resource model from Phase 6.

**Primary files:** new Spells UI, casting-profile/spell models, rules modules.

- [ ] Model separate casting profiles per class, including casting ability, caster level, prepared/spontaneous mode, and progression.
- [ ] Add known spells, spellbook entries, prepared slots, and available/used slots for levels 0–9.
- [ ] Provide edition-specific base slot progression, ability-based bonus slots, and spell DC calculations; handle cantrips/orisons separately.
- [ ] Prevent bonus slots from unlocking spell levels the character cannot yet cast.
- [ ] Support spell metadata: casting time, range, targets, duration, components, saves, SR, and notes.
- [ ] Track concentration, spell penetration modifiers, and armor-related arcane spell failure where applicable.
- [ ] Represent domain/specialist/restricted slots, metamagic, and spell-like abilities distinctly or through explicit documented overrides.
- [ ] Implement prepare, cast/use, restore, and rest flows with validation and clear remaining resources.
- [ ] Allow custom spells and manual caster-level progression exceptions without a live compendium dependency.

**Acceptance:** Reference prepared and spontaneous casters can prepare/cast/rest correctly; multiclass casting pools remain independent; DCs and slots match the supported rules and survive save/load.

### Phase 8 — Navigation, usability, accessibility, and complete printing (P2)

**Dependencies:** Section models/UI from Phases 3–7; accessibility work should also accompany each earlier component.

- [ ] Choose route-backed tabs or synchronize a URL fragment/query with tabs; eliminate misleading placeholder routes.
- [ ] Preserve the shared character state through navigation and support refresh/deep links/browser Back.
- [ ] Add labels, accessible table/row structure, keyboard navigation, visible focus, validation descriptions, and announced save/error status.
- [ ] Replace alert/console workflows with accessible dialogs and inline feedback.
- [ ] Make dense grids usable at phone/tablet widths and browser zoom; avoid clipped labels and inaccessible controls.
- [ ] Add useful page titles, empty states, and help distinguishing calculated values from editable inputs.
- [ ] Build a dedicated full-sheet print view using the same current state and calculations, independent of active tab.
- [ ] Include all sections, full descriptions/notes, selected dropdown values, and custom content in print.
- [ ] Remove stale `.content-area` assumptions and blanket break-avoid rules that prevent long sections from paginating.
- [ ] Test Letter/A4, multi-page spell lists, large inventories, and browser Save as PDF.

**Acceptance:** Every section is keyboard-accessible and usable on narrow screens; printing from any tab produces the same complete character without clipped long content.

### Phase 9 — Offline support, deployment, and release validation (P2)

**Dependencies:** Phases 1–8.

- [ ] Add a web app manifest, icons, and a service worker/offline shell compatible with the static deployment.
- [ ] Cache versioned assets and bundled reference data; keep character data in IndexedDB rather than treating cached pages as backups.
- [ ] Design update prompts/cache invalidation so app upgrades and database migrations cannot strand or overwrite unsaved work.
- [ ] Document that offline availability requires a successful first load/cache; test cold reopening afterward.
- [ ] Verify base-path assets, direct URLs, refresh behavior, and fallback/prerender strategy on GitHub Pages.
- [ ] Resolve the current `index.html` fallback overwrite warning deliberately.
- [ ] Add deployment concurrency/environment safeguards and run the quality gates before publishing.
- [ ] Replace the scaffold README with setup, supported rules, usage, storage/privacy, backup/import, offline, print, and deployment instructions.
- [ ] Document local-storage limitations, unsupported rule exceptions, source attributions, and recovery steps.
- [ ] Run cross-browser and representative long-character performance tests.

**Acceptance:** The deployed app works under `/PF1-Character-Sheet`, a cached installation reopens offline with its saved characters, updates preserve data, and all release scenarios below pass.

## 5. Test and acceptance matrix

| Layer | Required coverage |
| --- | --- |
| Pure rules | Odd/low ability modifiers, zero/negative values, all BAB/save progressions, multiclass rounding, size tables, negative Dexterity, AC types, HP order/minimums, skill budgets/caps, typed modifier stacking, attack routines, encumbrance, spell DCs/slots |
| Store/reactivity | Ability/class/equipment/condition changes propagate to every dependent value; overrides remain explicit; row edits/removal do not affect another record |
| Component | Class dropdown/custom-name edge cases; real-state save binding; empty numeric input; validation, labels, focus, and resource controls |
| Persistence | Plain snapshot serialization, create/update-by-ID, duplicate names, rename/delete, legacy migration, malformed/oversized/future-version imports, complete replacement, quota/storage errors, conflict handling |
| Browser | New → edit → save → reload → load → export → import → print; destructive-action guards; navigation and mobile/zoom behavior |
| Deployment/offline | Production base path, direct links, missing-page behavior, cached offline restart, controlled update, migration/recovery |
| Print | All sections from every active tab, Letter/A4, long notes, spell lists/inventories spanning pages |

Suggested reference characters: a first-level Fighter, a Rogue with trained skills and ACP, a multiclass martial/caster, a prepared caster, a spontaneous caster, and a custom-class character. Add small/large-size and negative-Dexterity variants. Validate expected values against the chosen rules sources.

## 6. Delivery order and completion gates

| Milestone | Work | Exit gate |
| --- | --- | --- |
| A — Trusted foundation | Phases 0–3 | PF1e confirmed; clean checks; safe storage/import; corrected main calculations |
| B — Playable non-caster | Phases 4–6 | Skills, equipment, combat, features, and session resources work end to end |
| C — Complete sheet | Phase 7 plus section integration | Prepared/spontaneous/multiclass spellcasting and all advertised sections usable |
| D — Release ready | Phases 8–9 | Whole-sheet PDF/print, accessible responsive UI, tested offline deployment, documented backup/recovery |

Start testing in Phase 1 and add it with each feature; do not defer correctness tests until release. Build the shared model before parallelizing new sections. Gear/armor must be integrated before claiming complete combat or skill penalties.

### Final definition of done

- [ ] The selected edition and supported rules are documented and do not conflict with displayed calculations.
- [ ] No required tab is a placeholder or depends on browser-console actions.
- [ ] Reference characters pass independent calculation checks.
- [ ] Supported values update reactively, display their sources, and persist correctly.
- [ ] Existing data migrates safely; invalid imports and failed storage operations do not destroy the active sheet.
- [ ] Full character creation, session use, save/load, backup/restore, and print workflows pass.
- [ ] Whole-sheet print/PDF works regardless of the active tab.
- [ ] Cached offline use and deployed base-path navigation pass browser tests.
- [ ] Type checks, tests, linting, and production build pass in CI.
- [ ] Remaining unsupported rules are explicit and have usable manual-entry/override paths.