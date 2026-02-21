# Session: Suppress tip during brush interaction

Date: 2026-02-14

## Goal

When a user starts a brush drag while a tip is visible, the tip should be immediately cancelled and stay hidden for the duration of the brush gesture.

## Changes

### `src/interactions/brush.js`

- On `"start"` (with a real user event, i.e. `sourceEvent` exists): add CSS class `"plot-brushing"` to the SVG
- On `"end"` with null selection (brush cleared): remove class `"plot-brushing"`
- When the brush ends with an active selection, the class stays — this prevents sticky tips while a brush selection is visible

### `src/interactions/pointer.js`

1. **`pointerdown`**: Three-way branch after sticky handling:
   - If `plot-brushing` class is present: immediately cancel the tip via `update(null)` and return (without `stopImmediatePropagation`, so the brush event continues)
   - Otherwise: make the tip sticky as before

2. **`pointermove`**: Split the early-return for drag into two cases:
   - `state.sticky` → return (unchanged)
   - Mouse drag (`buttons === 1`) → `update(null)` to hide any non-sticky tip during drag (catches edge cases and non-brush drags)

### `test/plots/brush.ts`

- Added `brushDotTip` test combining brush + `tip: true` on focus dots

## Decisions

- Only add `plot-brushing` on user-initiated brush start (`event.sourceEvent` check), not on programmatic `brush.move()`, to avoid baking the class into snapshot SVGs
- Only remove `plot-brushing` when the brush ends with a null selection (cleared), not when it ends with an active selection — this keeps tip suppression active while a brush is present
- Use `return void update(null)` (skip `stopImmediatePropagation`) when cancelling tip on brush start, so the brush event can propagate normally
