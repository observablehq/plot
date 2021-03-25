import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barX(penguins, Plot.stackX(Plot.groupZ({x: "count"}, {normalize: true, fill: "species"}))),
      Plot.text(penguins, Plot.stackXMid(Plot.groupZ({x: "count", text: "first"}, {normalize: true, z: "species", text: "species"}))), // TODO only normalize x, not text
      Plot.ruleX([0, 1])
    ]
  });
}
