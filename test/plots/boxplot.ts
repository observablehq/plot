import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function boxplot() {
  return Plot.boxX([0, 3, 4.4, 4.5, 4.6, 5, 7]).plot();
}

export async function boxplotFacetInterval() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    fy: {
      grid: true,
      tickFormat: String, // for debugging
      interval: 0.1,
      reverse: true
    },
    marks: [
      Plot.boxX(
        olympians.filter((d) => d.height),
        {x: "weight", fy: "height"}
      )
    ]
  });
}

export async function boxplotFacetNegativeInterval() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    fy: {
      grid: true,
      tickFormat: String, // for debugging
      interval: -10, // 0.1
      reverse: true
    },
    marks: [
      Plot.boxX(
        olympians.filter((d) => d.height),
        {x: "weight", fy: "height"}
      )
    ]
  });
}
