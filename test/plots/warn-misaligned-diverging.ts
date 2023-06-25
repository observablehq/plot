import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function warnMisalignedDivergingDomain() {
  return Plot.cellX(d3.range(-5, 6), {x: Plot.identity, fill: Plot.identity}).plot({
    color: {legend: true, type: "diverging", domain: [-5, 5, 10]}
  });
}
