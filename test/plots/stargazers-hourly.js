import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const stargazers = await d3.csv("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "New stargazers per hour →"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(stargazers, Plot.binX({y: "count"}, Plot.binX({x: "count", thresholds: d3.utcHour}, {x: "date"}))),
      Plot.ruleY([0])
    ]
  });
}
