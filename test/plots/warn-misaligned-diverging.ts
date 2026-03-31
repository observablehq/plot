import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export function warnMisalignedDivergingDomain() {
  return Plot.cellX(d3.range(-5, 6), {x: Plot.identity, fill: Plot.identity}).plot({
    color: {legend: true, type: "diverging", domain: [-5, 5, 10]}
  });
}
