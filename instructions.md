We are going to implement for real the prototype of Plot.brush that I developed in this notebook:
https://observablehq.com/@observablehq/plot-data-less-brush

1. read the code, and understand how it works
2. port it to this repository
3. make sure to always simplify the code as much as possible, and follow code style from this repo (see interactions/ in particular)
4. add a simple unit test so I can play with it

Once this is done, we will have to implement all the todos one by one. We need to prioritize so that we get to a complete support for information flow (e.g. the setter is more important than compatibility with tip).

You can find todos at the top of the notebook but also inside the code. Make a prioritized list of all the todos and add it at the bottom of this file (instructions.md).

Don't forget to write session notes.

---

## PR description

A data-less brush mark that renders a 2D rectangular brush, enabling selection and filtering. The brush mark has `aria-label="brush"`.

The brush dispatches input events with the selection bounds (x1, x2, y1, y2) in data space and a filter function to test whether a point falls inside the selection.

Brushes support faceted plots: each facet gets its own brush, starting one clears the others, and the value includes fx/fy as relevant (with support in the filter function).

Three reactive mark options transforms — `brush.inactive`, `brush.context`, `brush.focus` — allow marks to respond to state by showing/hiding points inside or outside the selection. Reactive marks re-render as the brush moves, with `pointerEvents` set to "none" by default so they don't obstruct interaction if they are above the brush (which achieves better contrast in general).

The brush supports geographic projections: in that casse, though, the {x1, x2, y1, y2} coordinates are returned in pixel space; but the filter projects lon/lat automatically for hit-testing.

A `pending` flag distinguishes brushing events (user gesture) from committed selections when the brush gesture ends and the user releases the pointer. This is to allow workflows where we don't want to reredner continuously during brushing (e.g. to avoid costly calls to a database backend).

The brush has a `move` property that allows the brush to be moved programmatically.


Ideas for future PRs:

- **Support (options)** - control the brush's appearance; 
- **Data-based brush** — support both `(options)` and `(data, options?)` signatures; when data is passed, return filtered data as `value.data`.
- **brushX, brushY** — directional brush variants, maybe with options (frameAnchor, snap, etc.)
- **neuter tip interaction** — find mechanism to suppress tips during brushing (possibly className flag)
- **Z awareness** — per Plot PR #1671; consider z option for reactive marks
- **Intersection algorithm** — support complex shapes (lines); currently only point-in-rect
- **pixel precision inverse** — round inverted values to the minimal precision that distinguishes half-pixels; for example: numbers as integers, dates as days. Needs a bit of research. Also we want uniform precision for linear/utc scales.


AI disclosure: I used @claude to help me generate the unit tests and maintain an action plan.
