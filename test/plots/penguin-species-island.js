import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.barY(data, Plot.stackY(Plot.groupX({x: "species", fill: "island"}))),
      Plot.ruleY([0])
    ]
  });
}
