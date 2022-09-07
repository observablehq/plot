import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.areaY(AAPL, {x: "Date", y: "Close", fillOpacity: 0.1}),
      Plot.lineY(AAPL, {x: "Date", y: "Close"}),
      Plot.ruleY([0])
    ]
  });
}
