import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function pairsArea() {
  return Plot.areaY({length: 15}, {y: d3.randomLcg(42), stroke: (d, i) => i >> 1}).plot({axis: null, height: 140});
}
