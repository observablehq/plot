import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function uniformRandomDifference() {
  const random = d3.randomLcg(42);
  return Plot.plot({
    x: {
      label: "Difference of two uniform random variables",
      labelAnchor: "center"
    },
    y: {
      grid: true,
      percent: true
    },
    marks: [Plot.rectY({length: 10000}, Plot.binX({y: "proportion"}, {x: () => random() - random()})), Plot.ruleY([0])]
  });
}
