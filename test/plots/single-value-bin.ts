import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function singleValueBin() {
  return Plot.rectY([3], Plot.binX()).plot();
}
