import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/software-versions.csv");
  return Plot.plot({
    x: {
      percent: true
    },
    marks: [
      Plot.barX(data, Plot.stackX(Plot.groupZ({x: "proportion"}, {fill: "version", insetLeft: 0.5, insetRight: 0.5}))),
      Plot.textX(data, Plot.stackX(Plot.groupZ({x: "proportion", text: "first"}, {z: "version", text: "version"}))),
      Plot.ruleX([0, 1])
    ]
  });
}
