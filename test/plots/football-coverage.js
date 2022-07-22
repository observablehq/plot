import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const football = await d3.csv("data/football-coverage.csv", d3.autoType);
  return Plot.plot({
    x: {
      axis: null
    },
    y: {
      grid: true,
      domain: [0, 0.5],
      tickFormat: "%"
    },
    facet: {
      data: football,
      x: "coverage"
    },
    marks: [
      Plot.frame(),
      Plot.dot(football, Plot.stackX({offset: "center", y: (d) => +d.value.toFixed(2), fill: "black"}))
    ]
  });
}
