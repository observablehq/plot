import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-congress-members.csv", d3.autoType);
  return Plot.plot({
    height: 300,
    x: {
      nice: true,
      label: "Age →",
      labelAnchor: "right"
    },
    y: {
      grid: true,
      label: "← Women · Men →",
      labelAnchor: "center",
      tickFormat: Math.abs
    },
    marks: [
      Plot.dot(data, Plot.stackY2({
        x: d => 2021 - d.birth,
        y: d => d.gender === "M" ? 1 : d.gender === "F" ? -1 : 0,
        fill: "gender",
        title: "full_name"
      })),
      Plot.ruleY([0])
    ]
  });
}
