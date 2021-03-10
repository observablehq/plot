import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const random = d3.randomLcg(42);

export default async function() {
  return Plot.plot({
    x: {
      label: "Difference of two uniform random variables",
      labelAnchor: "center"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.rectY({length: 10000}, Plot.binX({x: () => random() - random(), normalize: true})),
      Plot.ruleY([0])
    ]
  });
}
