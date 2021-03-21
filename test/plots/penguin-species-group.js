import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    x: {
      grid: true
    },
    marks: [
      Plot.barX(penguins, Plot.stackX(Plot.groupZX({fill: "species", normalize: true}))),
      Plot.ruleX([0, 100])
    ]
  });
}
