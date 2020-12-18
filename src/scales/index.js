// Positional scales have associated axes, and for ordinal data, a point or band
// scale is used instead of an ordinal scale.
export const position = Symbol("position");

// Color scales default to the turbo interpolator for quantitative data, and to
// the Tableau10 scheme for ordinal data. In the future, color scales may also
// have an associated legend.
export const color = Symbol("color");

// Radius scales default to the sqrt type, have a default range of [0, 3], and a
// default domain from 0 to the median first quartile of associated channels.
export const radius = Symbol("radius");

// TODO Rather than hard-coding the list of known scale names, collect the names
// and categories for each plot specification, so that custom marks can register
// custom scales.
export const registry = new Map([
  ["x", position],
  ["y", position],
  ["fx", position],
  ["fy", position],
  ["r", radius],
  ["z", null],
  ["color", color]
]);

// just thinking about how (cartesian) positional scales have axes, but radial
// scales don't. why not? well, they could — but only for a single fixed center!
// in practice, radial scales are almost always used to scale circles with
// different centers, so each would need its own axis. so it's like faceting!!
// an un-faceted radial visualization would have a shared center; if there are
// circles with dif centers, it's faceted by x and y.