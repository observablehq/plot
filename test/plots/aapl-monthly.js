import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/aapl.csv", d3.autoType);
  const bin = {x: "Date", y: "Volume", thresholds: 40};
  const q1 = data => d3.quantile(data, 0.25);
  const q3 = data => d3.quantile(data, 0.75);
  return Plot.plot({
    y: {
      transform: d => d / 1e6,
      label: "↑ Daily trade volume (millions)",
      round: true
    },
    marks: [
      Plot.ruleY([0]),
      Plot.ruleX(data, Plot.binX({...bin, stroke: "#999", reduce: {y1: "min", y2: "max"}})),
      Plot.rect(data, Plot.binX({...bin, fill: "#bbb", reduce: {y1: q1, y2: q3}})),
      Plot.ruleY(data, Plot.binX({...bin, strokeWidth: 2, reduce: {y: "median"}}))
    ]
  });
}
