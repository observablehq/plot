import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function stargazersHourly() {
  const stargazers = await d3.csv<any>("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "New stargazers per hour",
      tickFormat: (d) => (d > 10 ? "" : d === 10 ? "10+" : d)
    },
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(
        stargazers,
        Plot.binX(
          {y: "count", interval: 1},
          Plot.binX({x: (d) => Math.min(10, d.length), thresholds: "hour"}, {x: "date"})
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
