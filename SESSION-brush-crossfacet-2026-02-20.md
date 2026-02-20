# Session: Cross-facet brushing

## Goal

Add `Plot.brush({sync: true})` to allow brushing across all facet panes simultaneously.

## Design decisions

- `sync: true` on the brush means the brush selection spans all facets
- When brushing in one facet, the same rectangle appears in all facets (programmatic sync via D3 brush.move)
- The dispatched value still includes `fx`/`fy` (the origin facet)
- The filter function's facet arguments are optional: omit them to select across all facets, pass them to restrict to the brushed facet
- Context/focus updates apply to ALL facets, not just the current one
- Closure `syncing` flag prevents recursive events from programmatic brush moves
- `brush.move()` with `sync: true` moves one node and lets the event handler sync the rest

## Changes

- `src/interactions/brush.js`: constructor accepts `{sync}` option, event handler branches for cross-facet behavior
- `src/interactions/brush.d.ts`: added `BrushOptions` interface with `sync` option, updated constructor and `brush()` signatures
- `test/plots/brush.ts`: added `brushCrossFacet` snapshot test (penguins, fx: species)
- `test/output/brushCrossFacet.html`: generated snapshot
- `test/brush-test.ts`: three new unit tests for optional facet args and cross-facet filter
- `docs/interactions/brush.md`: documented `sync: true` option and optional facet filter args

## Implementation notes

- Replaced local `clearing` with closure `syncing` + early return. Prevents all event types from recursive programmatic moves (the old `clearing` only guarded "start").
- For `sync: true` + `move()`: moves only the first brush node; the event handler syncs the rest.
- `filterSignature` keeps the original per-case signatures but facet args are optional: if `fx` or `fy` is undefined (not passed), the corresponding facet check is skipped. No facets → `(x, y)`.
- Option renamed from `facet: false` to `sync: true` (clearer intent).
- Hidden doc examples with `d3.timeout` must use `:::plot hidden` (not `defer`), otherwise the timeout doesn't fire.
- All 1288 tests pass, TypeScript compiles, ESLint + Prettier clean.
