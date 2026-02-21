# Session: Hexbin offset fix

## Context

The hexbin grid origin (`ox`, `oy`) was hardcoded to `0.5, 0`. After commit aa880979 changed the pixel `offset` from 0.5 to 0 in the test environment, the hexbin output shifted because the grid origin didn't account for the coordinate shift caused by offset-dependent margins.

## Decisions

### ox = -offset, oy = -offset

The margins shift all coordinates by `-offset`. The grid origin shifts by the same amount so binning is identical across offset values: `ox = -offset`, `oy = -offset`.

The old `ox = 0.5` hack is no longer needed thanks to center-directed rounding (see below).

### Center-directed rounding (fixes both edges)

The core problem: `Math.round(n.5) = n+1` in JS, which creates floating bins outside the frame when data lands exactly on a grid boundary. The old fix was `ox = 0.5` (shifting the grid to avoid .5 boundaries on the right), but this caused floating bins on the left odd rows.

The new approach: a continuous `round(x, center)` function that pulls x infinitesimally toward the center before rounding:
```js
function round(x, center) {
  return Math.round(center + (x - center) * (1 - 1e-12));
}
```

The center is computed from `dimensions` (the midpoint of the frame in bin-index space) and passed to `hbin`.

### Hexgrid mark

Uses `ox, oy` directly in `applyTransform` (no more `offset + ox, offset + oy` since ox already accounts for offset).

Grid bounds fixed to account for odd-row hex offset:
```js
i0 = Math.floor((x0 - rx) / wx),
i1 = Math.ceil((x1 + rx) / wx),
```
This ensures odd-row hexes at the frame edge are included (with ox=0, the old `floor(x0/wx)` missed them).

## Verification

### Tests
- All 1270 tests pass

### Snapshot comparison (hexbin.svg)
- **Main vs Committed (both ox=0.5, different offset)**: Identical bin positions — confirms binning is offset-independent when ox compensates
- **Committed vs New (ox=0.5→0)**: 190→192 bins. ~10 boundary bins shifted to adjacent grid positions, net +2 bins. Expected consequence of removing the 0.5 hack
- **Hexgrid**: 660→682 cells (+22, one extra clipped column from the bounds fix)

### hexbinEdge regression test
- 0 truly floating hexes (no hex whose visible area is entirely outside the frame)
- All x centers within frame (20–610)
- Worst-case y: 2.7px outside frame (well within hex radius of 11.5px), so large portion visible

## Current state

- `src/transforms/hexbin.js`: `ox = -offset, oy = -offset`, center-directed `round(x, center)`
- `src/marks/hexgrid.js`: uses `ox, oy` directly, expanded i bounds for odd-row edge hexes
- `test/plots/hexbin-edge.ts`: regression test with data on all 4 edges
- All 1270 tests pass

## Notes

- Test dimensions (width=630, margin=0, inset=20, binWidth=20) chosen so right edge (610) hits .5 boundary: 610/20 = 30.5
- Left odd-row boundary also at .5: (20/20) - 0.5 = 0.5
- Both resolved by center-directed rounding: right rounds down to 30, left rounds up to 1
- The 1e-12 epsilon needs to be small enough not to affect non-.5 values but large enough to survive float64 precision
