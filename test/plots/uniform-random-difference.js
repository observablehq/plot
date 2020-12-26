import * as Plot from "@observablehq/plot";
import {randomLcg} from "d3-random";

const random = randomLcg(42);

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
      Plot.binX({length: 10000}, {x: () => random() - random(), normalize: true}),
      Plot.ruleY([0])
    ]
  });
}
