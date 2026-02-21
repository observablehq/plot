# Session: Data-less brush interaction

Date: 2026-02-12

## Goal

Port the Plot.brush prototype from the [data-less brush notebook](https://observablehq.com/@observablehq/plot-data-less-brush) into the Observable Plot repository.

## Decisions

- Brush is a `Mark` subclass (unlike pointer, which is a render transform), because it needs to render its own SVG element (d3.brush)
- File: `src/interactions/brush.js`, exported from `src/index.js`
- Constructor takes no arguments: `new Brush()` or `brush()`
- Three reactive render filters: `inactive` (visible by default), `context` (hidden by default, shows non-selected during brush), `focus` (hidden by default, shows selected during brush) — placed directly on the instance
- Private properties: `_brush` (d3 brush instance), `_brushNodes` (array of rendered SVG nodes)
- Dispatched value: `{x1, x2, y1, y2, filter, fx?, fy?}` where `filter(x, y, f1?, f2?)` tests point membership
- Filter signature varies by faceting: `(x, y)`, `(x, y, fx)`, `(x, y, fy)`, or `(x, y, fx, fy)`
- For geo projections, filter uses `projection.stream` to project lon/lat to pixels
- Facet data from `target.__data__` (set by Plot's `.datum(f)`)
- Event handler uses regular `function` (not arrow) so `this` is the DOM node for programmatic moves
- `event.sourceEvent.currentTarget` for user events; `this` for programmatic moves
- `clearing` flag prevents recursive event re-entry when clearing other facets
- Only clear other facets on trusted events (`event.sourceEvent`)
- **IIFE pattern for docs**: Hidden :::plot blocks use `((brush) => [...])(Plot.brush())` to create a fresh brush on each Vue re-render, avoiding stale `_brushNodes` accumulation
- **Preselection via d3.timeout**: Vue template expressions can't access window globals (`requestAnimationFrame`, `setTimeout`), so use `d3.timeout()` inside a comma operator expression
- **"Reactive marks"** is the term for brush.inactive/context/focus (not "companion marks")
- **Async geo data**: world and cities loaded via shallowRef + d3.json/csv in onMounted; geo section wrapped in `v-if` to avoid flash of empty chart
- **aria-label="brush"**: Added to the brush mark's `<g>` element

## Files created

- `src/interactions/brush.js` — main implementation
- `src/interactions/brush.d.ts` — TypeScript definitions with BrushValue interface
- `docs/interactions/brush.md` — documentation page
- `test/plots/brush.ts` — 9 snapshot tests with textarea logging
- `test/brush-test.ts` — 5 unit tests
- `test/output/brush*.html` — generated snapshots

## Files modified

- `src/index.js` — added `Brush, brush` export
- `src/index.d.ts` — added `export * from "./interactions/brush.js"`
- `test/plots/index.ts` — added brush.ts export
- `docs/features/interactions.md` — rewrote "Selecting" section with simple brush example
- `docs/.vitepress/config.ts` — added Brush to sidebar

## Key fixes during development

- Programmatic `d3.select(node).call(brush.move, …)` had no `sourceEvent`, so target was never assigned. Fixed: use `this` (the DOM node) as fallback.
- Recursive clear: `selectAll(nodes).call(brush.move, null)` triggers recursive start events that overwrite `target`/`currentNode`. Fixed with `clearing` flag.
- Clearing current node cancels programmatic move. Fixed: filter `_brushNodes` to exclude `currentNode` when clearing.
- Only clear on trusted events: programmatic moves don't need to clear others. Added `if (event.sourceEvent)` guard.
- `brushGeoUS` with `reflect-y` showed zero circles because y coordinates weren't negated. Fixed by negating `py` in pre-projection.
- Dots rendered above brush block pointer events. Fixed with `pointerEvents: "none"` on reactive marks.
- Vue parser can't handle block-body arrow functions `{ }` in :::plot blocks. Use concise arrow bodies or comma operator expressions instead.
- Vue template expressions don't have access to `requestAnimationFrame` or `setTimeout`. Use `d3.timeout()` instead.

## Snapshot tests

| Test | Description |
|------|-------------|
| brushSimple | Basic brush with dots, no reactive marks |
| brushDot | Penguins with inactive/context/focus, colored by species |
| brushFaceted | Penguins faceted by species (fx), with frame |
| brushFacetedFy | Penguins faceted by species (fy), with frame |
| brushFacetedFxFy | Penguins faceted by species (fx) and sex (fy), with frame |
| brushGeoUS | Pre-projected US state capitals with reflect-y |
| brushGeoWorld | World cities >500k with equal-earth projection |
| brushGeoWorldFaceted | World cities faceted by median population (fy), with frame |
| brushRandomNormal | 1000 seeded randomNormal [x, y] tuples |

## Known issues

- Re-render bug in brush.js: calling Plot.plot() multiple times with the same Brush instance accumulates stale `_brushNodes` and `updatePerFacet` entries. Workaround: use IIFE to create fresh brush each render. Not fixed in source.

## SSR fix (2026-02-20)

`:::plot hidden` examples with `brush.move()` crashed CI because:
1. During SSR, `d3.create("svg:g")` fails (no global `document`) — Vue catches this gracefully
2. `d3.timeout(() => brush.move({...}))` fires asynchronously via setTimeout after SSR
3. `brush.move()` was throwing `Error: No brush node found` — unhandled exception crashes Node

Fix: `brush.move()` now silently returns when no matching node is found, instead of throwing. Also simplified the hero example to use `brush.move()` instead of low-level `d3.select().call()`.

## Status

All 1284 tests pass (mocha, tsc, eslint, prettier).
