# Session: Brush data and options support

Date: 2026-02-14
Branch: fil/brush-data-options

## Goal

Make the Brush mark accept `(data, options)` like other marks (Dot, etc.), enabling:
- Styling the selection rectangle (fill, stroke, etc.)
- Declaring channel defaults (x, y, fx, fy) inherited by reactive filters
- Array-of-arrays data via `maybeTuple`
- Filtered data on `plot.value.data` when brush has data

## Changes

### `src/interactions/brush.js`
- Constructor accepts `(data, options)`, passes them to `super()`
- Declares x/y channels with `{scale, optional: true}`; fx/fy handled by Mark base class (not declared as channels, matching other marks)
- Stores `_selectionStyle` for fill/stroke overrides on `.selection` rect; applied via `applyAttr`
- `renderFilter` accepts `channelDefaults` spread before caller options
- `initialize()` captures arrayified data as `_data`, resolves FX/FY via `valueof`
- Render method includes `data` (filtered) in dispatched values
- Factory `brush(data, options)` applies `maybeTuple(x, y)` for `[[x,y]]` data

### `src/interactions/brush.d.ts`
- Added `BrushOptions` interface extending `MarkOptions` with x/y channels
- Updated `Brush` constructor and `brush()` factory signatures
- Added `data?: any[]` to `BrushValue`

### `docs/interactions/brush.md`
- Added sections for data and options, selection styling, filtered data
- Updated BrushValue documentation

### `test/plots/brush.ts`
- `brushBrutalist`: styled brush with `stroke: "currentColor"`, `strokeWidth: 3`, channel defaults inherited
- `brushCoordinates`: array-of-arrays data via `Plot.brush(data)` with `maybeTuple`

### `test/brush-test.ts`
- Unit tests for filtered data in value (array and generator data)
- Unit test for render transform composition

## Decisions

- Mark-level defaults use `fill: "none", stroke: "none"` — the `<g>` wrapper needs no fill/stroke
- Selection rect styling stored in `_selectionStyle` (raw user values) because Mark defaults are for the `<g>`, not `.selection`; applied via `applyAttr` for consistency
- fx/fy not declared as channels (matching other marks); resolved via `valueof` in `initialize()`
- Channel defaults spread before `...options` in `renderFilter` so caller overrides
- `data: any[]` on BrushValue since it's always the result of `Array.filter()`

## Verification

- `yarn test` passes (1288 tests, TypeScript, ESLint, Prettier all green)
