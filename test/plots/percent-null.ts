import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function percentNull() {
  const time = [1, 2, 3, 4, 5];
  const value = [null, null, 1, null, null];
  return Plot.dot(time, {x: time, y: value}).plot({y: {percent: true}});
}
