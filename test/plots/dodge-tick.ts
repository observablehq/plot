import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function dodgeTick() {
  return Plot.tickX([1, 2, 3], Plot.dodgeY()).plot();
}
