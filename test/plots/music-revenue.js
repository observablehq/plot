import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/riaa-us-revenue.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Annual revenue (billions, adj.)",
      transform: d => d / 1000
    },
    marks: [
      Plot.areaY(data, {
        transform: Plot.stackY({order: "appearance", reverse: true}),
        x: "year",
        y: "revenue",
        z: "format",
        fill: "group",
        title: d => `${d.format}\n${d.group}`
      }),
      Plot.lineY(data, {
        transform: Plot.stackY2({order: "appearance", reverse: true}),
        x: "year",
        y: "revenue",
        z: "format",
        stroke: "white",
        strokeWidth: 1
      }),
      Plot.ruleY([0])
    ]
  });
}
