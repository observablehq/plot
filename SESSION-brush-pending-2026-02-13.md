# Session: Brush improvements

**Date:** 2026-02-13
**Branch:** fil/brush-dataless

## Summary

Three improvements to the brush mark:

1. **`pending` field** — intermediate brush values (start, brush events) include `pending: true`; committed values (end events) omit it, so listeners can skip in-progress updates.
2. **Default `pointerEvents: "none"`** — reactive marks (inactive, context, focus) now default to `pointerEvents: "none"`, so the brush can be placed below all three layers without users needing to set it explicitly.
3. **Compose user render transforms** — reactive marks now use `composeRender` to chain with any user-provided render transform, matching the pattern from `pointer.js`.

## Changes

### `src/interactions/brush.js`
- Import `pointer` and `composeRender`
- Null selection + non-end event: dispatch `{pending: true, x1, y1, …}` with pointer position (if `sourceEvent` exists), or `null` for programmatic clearing
- Non-null selection: include `pending: true` for start/brush events, omit for end
- `renderFilter`: default `pointerEvents: "none"`, destructure `render` from options and compose with `composeRender`

### `src/interactions/brush.d.ts`
- Added `pending?: true` to `BrushValue`

### `docs/interactions/brush.md`
- Documented `pending` property and the pattern for skipping intermediate values
- Added example showing `data.filter` with the brush filter
- Removed `pointerEvents: "none"` from all examples
- Moved brush below reactive marks in all examples
- Added tip about default `pointerEvents`

### `test/brush-test.ts`
- Updated "brush dispatches value on programmatic brush move" to verify intermediate values have `pending` and committed values don't
- Added "brush reactive marks compose with user render transforms" test

### `test/plots/brush.ts`
- Removed redundant `pointerEvents: "none"` from all snapshot tests

## Decisions

- During programmatic `brush.move(null)` (clearing other facets), `event.sourceEvent` is null, so those events still dispatch `null` rather than a pointer-based value
- Snapshot tests are unaffected because they only capture the final committed value (from "end" events), which has no `pending`

## Future: move overlay to top of SVG

Moving the brush `.overlay` rect to the top of the SVG would eliminate the need for `pointerEvents: "none"` entirely.

**Why it's hard:**

- d3-brush attaches event listeners directly on the `.overlay` rect
- Internally, d3-brush uses `this.parentNode` to navigate from the overlay to the selection rect and handles — moving the overlay out of its `<g>` group breaks this
- With faceting, each brush group has a transform; a proxy rect at the SVG root would need to account for that transform to forward events correctly

**Possible approach — proxy rect:**

Create a transparent rect at the top of the SVG that forwards pointer events to the real overlay (which gets `pointer-events: none`). The proxy dispatches synthetic events on the real overlay, preserving `clientX`/`clientY` so d3-brush's coordinate math works. Non-faceted case is straightforward; faceted case needs transform handling.

## Verification

- `yarn test:mocha` — 1284 passing
- `yarn test:tsc` — clean
- `yarn test:prettier` — clean
- `yarn test:lint` — clean
