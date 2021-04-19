import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    y: {
      percent: true
    },
    fx: {
      tickSize: 6
    },
    facet: {
      data: penguins,
      x: "species"
    },
    marks: [
      Plot.barY(penguins, Plot.stackY(Plot.groupZ({fill: "island", reduce: {y: "proportion-facet"}}))),
      Plot.ruleY([0])
    ]
  });
}
