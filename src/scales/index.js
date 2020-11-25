export const position = Symbol("position");
export const radius = Symbol("radius");
export const color = Symbol("color");

// TODO Allow arbitrary scale names to be registered by marks.
export const registry = new Map([
  ["x", position],
  ["y", position],
  ["fx", position],
  ["fy", position],
  ["r", radius],
  ["z", null],
  ["color", color]
]);
