import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function collapsedHistogram() {
  return Plot.rectY([1, 1, 1], Plot.binX()).plot();
}
