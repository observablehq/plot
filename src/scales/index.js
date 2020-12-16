// Positional scales have associated axes, and for ordinal data, a point or band
// scale is used instead of an ordinal scale.
export const position = Symbol("position");

// Color scales default to the turbo interpolator for quantitative data, and to
// the Tableau10 scheme for ordinal data. In the future, color scales may also
// have an associated legend.
export const color = Symbol("color");

// Size scales default to the linear type, have a default range of [0, 27], and a
// default domain from 0 to the median first quartile of associated channels.
export const size = Symbol("size");

// TODO Rather than hard-coding the list of known scale names, collect the names
// and categories for each plot specification, so that custom marks can register
// custom scales.
export const registry = new Map([
  ["x", position],
  ["y", position],
  ["fx", position],
  ["fy", position],
  ["size", size],
  ["z", null],
  ["color", color]
]);
