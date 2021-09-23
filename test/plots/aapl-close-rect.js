import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const AAPL = (await d3.csv("data/aapl.csv", d3.autoType)).slice(-90);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(AAPL, {x: "Date", interval: d3.utcDay, y: "Close"}),
      Plot.ruleY([0])
    ]
  });
}
