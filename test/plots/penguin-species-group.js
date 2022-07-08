import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barX(penguins, Plot.stackX(Plot.groupZ({x: "proportion"}, {fill: "species"}))),
      Plot.text(penguins, Plot.stackX(Plot.groupZ({x: "proportion", text: "first"}, {z: "species", text: "species"}))),
      Plot.ruleX([0, 1])
    ]
  });
}
