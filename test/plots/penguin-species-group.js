import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barX(penguins, Plot.stackX(Plot.groupZ({x: "count"}, {fill: "species", normalize: true}))),
      Plot.text(penguins, Plot.stackXMid(Plot.groupZ({x: "count"}, {z: "species", normalize: true, text: ([d]) => d.species}))),
      Plot.ruleX([0, 100])
    ]
  });
}
