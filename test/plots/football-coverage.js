import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/football-coverage.csv", d3.autoType);
  return Plot.plot({
    facet: {
      data,
      x: "coverage"
    },
    x: {
      ticks: 0
    },
    y: {
      domain: [0, 0.5],
      ticks: d3.range(0, 1, 0.1),
      tickFormat: "%"
    },
    fx: {
      axis: "bottom"
    },
    marks: [
      Plot.frame({ stroke: "#ccc" }),
      Plot.ruleY(d3.range(0, 1, 0.1), { stroke: "#ccc" }),
      Plot.dot(
        data,
        Plot.stackX({
          offset: "silhouette",
          y: (d) => +d.value.toFixed(2),
          fill: "black"
        })
      )
    ]
  });
}
