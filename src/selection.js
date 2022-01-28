// This symbol is used by interactive marks to define which data are selected. A
// node returned by mark.render may expose a selection as node[selection], whose
// value may be an array of numbers (e.g., [0, 1, 2, …]) representing an
// in-order subset of the rendered index, or null if the selection is undefined.
// The selection can be updated during interaction by emitting an input event.
export const selection = Symbol("selection");

// Given two (possibly null, possibly an index, but not undefined) selections,
// returns true if the two represent the same selection, and false otherwise.
// This assumes that the selection is a in-order subset of the original index.
export function selectionEquals(s1, s2) {
  if (s1 === s2) return true;
  if (s1 == null || s2 == null) return false;
  const n = s1.length;
  if (n !== s2.length) return false;
  for (let i = 0; i < n; ++i) if (s1[i] !== s2[i]) return false;
  return true;
}
