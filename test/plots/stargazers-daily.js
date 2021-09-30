import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const stargazers = await d3.csv("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      // label: "↑ Stargazers added per week"
    },
    marks: [
      Plot.rectY(stargazers, Plot.binX({y: "count"}, Plot.binX({x: "count"}, {x: "date", thresholds: d3.utcDay}))),
      Plot.ruleY([0])
    ]
  });
}
