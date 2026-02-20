# Session: brushX and brushY marks

Date: 2026-02-15 / 2026-02-16
Branch: fil/brush-x

## Goal

Implement `brushX` and `brushY` marks for single-axis brushing, with an optional `interval` for snapping.

## Files changed (uncommitted, relative to last commit on branch)

- `src/interactions/brush.js` — 1D brush logic, interval snapping, filter functions
- `src/interactions/brush.d.ts` — types for brushX/brushY, BrushOptions, updated BrushValue
- `src/index.js` — added brushX, brushY exports
- `docs/interactions/brush.md` — documentation for 1D brushing, brushX, brushY, interval snapping
- `docs/components/links.js` — fixed anchor regex to allow dots in `{#id}` patterns
- `test/plots/brush.ts` — 7 new snapshot tests (brushXDot, brushYDot, brushXHistogram, brushXHistogramFaceted, brushXTemporal, brushXTemporalReversed, brushYHistogram)
- `test/brush-test.ts` — unit tests for 1D value shape and filter signatures
- `test/output/brushX*.html`, `test/output/brushY*.html` — generated snapshots

## Summary of changes

### `src/interactions/brush.js`

Extended the `Brush` class to support 1D brushing:

- **Constructor** accepts `dimension` (`"x"`, `"y"`, or `"xy"`) and optional `interval`. Uses `d3.brushX()`, `d3.brushY()`, or `d3.brush()` accordingly. The interval is normalized via `maybeInterval`.
- **Selection normalization**: 1D d3 brush selections (a `[min, max]` array) are normalized to 2D with NaN for the unconstrained dimension. Helper functions `inX`/`inY` treat NaN as "always passes".
- **Dispatched value**: only includes `x1`/`x2` (for brushX) or `y1`/`y2` (for brushY), not both.
- **Interval snapping**: on brush `"end"`, the selection snaps to the nearest interval boundaries using `intervalRound` (picks the closest of `floor` and `offset`). A `snapping` flag prevents infinite re-dispatch. If both endpoints round to the same value, the selection spans one interval. Pixel values are sorted with `ascending` to handle inverted scales.
- **Filter function**: `filterFromBrush` branches on `dim`. For 1D brushes, uses `filterSignature1D` which wraps a 1-argument test (testing just the relevant channel value). When an interval is set, the filter floors the value before testing, for consistency with binned marks.
- **`move()`**: handles 1D format (`[min, max]`) vs 2D (`[[x1,y1],[x2,y2]]`) for `d3.brush.move`.
- **`renderFilter`**: computes midpoints from `x1`/`x2` and `y1`/`y2` channels as fallback when `x`/`y` channels are absent (as with rect marks from `binX`/`binY`).

New helper functions:
- `intervalRound(interval, v)` — rounds to nearest interval boundary
- `filterSignature1D(test, currentFx, currentFy)` — 1-arg filter with facet support

New factory functions:
- `brushX({interval})` — horizontal brush
- `brushY({interval})` — vertical brush

### `src/interactions/brush.d.ts`

- `BrushValue` fields `x1`/`x2`/`y1`/`y2` are now optional (absent for the unconstrained dimension)
- `filter` signature relaxed to `(...args: any[]) => boolean` (1D has different arity)
- New `BrushOptions` interface with documented `interval` option (typed as `Interval`)
- `brushX(options?)` and `brushY(options?)` declarations

### `src/index.js`

Added `brushX, brushY` to the exports from `./interactions/brush.js`.

### `docs/interactions/brush.md`

- Added "1-D brushing" section with dodgeY dot example for brushX
- Updated filter table to show both 1D and 2D filter signatures
- Updated BrushValue documentation: x/y fields are absent for the unconstrained dimension
- Updated brush.move documentation for 1D brushes
- Added `brushX(*options*)` API section with interval histogram example
- Added `brushY(*options*)` API section
- All hidden previews now have initial brush selections via `d3.timeout`

### `docs/components/links.js`

Fixed anchor regex from `[\w\d-]+` to `[\w\d.-]+` to support anchors like `#brush.focus`.

### `test/plots/brush.ts`

New snapshot tests:
- **`brushXDot`** — dodgeY dot plot with horizontal brush on `body_mass_g`, height 170, marginTop 10
- **`brushYDot`** — dot plot with vertical brush, reactive marks on `culmen_depth_mm`
- **`brushXHistogram`** — histogram with three layers (inactive 0.8, context 0.3, focus 1), `thresholds: 40`
- **`brushXHistogramFaceted`** — histogram faceted by island, `fill: "species"` with color legend, three layers, `brushX({interval})`
- **`brushXTemporal`** — AAPL stock data, `brushX({interval: "month"})`, median Close reducer, three layers
- **`brushXTemporalReversed`** — same with `x: {reverse: true}`, tests snapping with inverted scales
- **`brushYHistogram`** — horizontal histogram with `brushY({interval: 0.5})` on `culmen_depth_mm`, three layers

### `test/brush-test.ts`

Unit tests verifying:
- brushX dispatches `x1`/`x2` without `y1`/`y2`
- brushY dispatches `y1`/`y2` without `x1`/`x2`
- 1D filter functions work correctly with facet arguments

## Design decisions

- **NaN normalization**: 1D selections are normalized to 2D with NaN for the unconstrained dimension. This lets the existing `ctx.update` and `focus.update` code stay unchanged — `inX`/`inY` helpers treat NaN as always passing.
- **Round, not floor**: brush endpoints snap to the nearest interval boundary rather than always flooring. This feels more natural — a brush endpoint near a boundary snaps to it regardless of direction.
- **Filter floors**: the filter function floors values via `interval.floor` before testing. This is correct for bin membership: a value belongs to the bin whose floor matches.
- **Projection guard**: `brushX`/`brushY` throw when used with projections (only `brush` supports projected coordinates).
- **Midpoint fallback in renderFilter**: rect marks (from `binX`/`binY`) have `x1`/`x2`/`y1`/`y2` channels but no `x`/`y`. The midpoint `(x1 + x2) / 2` is used for hit-testing against the brush bounds.
- **Three-layer opacity pattern**: histogram tests use inactive (0.8), context (0.3), focus (1) for clear contrast between states.
- **Snapping with inverted scales**: the snap code uses `.sort(ascending)` on pixel values to handle both normal and reversed scales correctly.
- **`Interval` type**: the `interval` option uses the existing `Interval` type from `src/interval.d.ts` which covers numbers, time interval names, and objects with `floor`/`offset` methods.

## State

All 1293 tests pass. TypeScript, lint, and prettier all pass. Uncommitted changes on top of the last commit on `fil/brush-x`.
