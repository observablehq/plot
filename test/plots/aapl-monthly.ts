import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplMonthly() {
  const data = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const bin = {x: "Date", y: "Volume", thresholds: 40};
  return Plot.plot({
    y: {
      transform: (d) => d / 1e6,
      label: "↑ Daily trade volume (millions)",
      round: true
    },
    marks: [
      Plot.ruleY([0]),
      Plot.ruleX(data, Plot.binX({y1: "min", y2: "max"}, {...bin, stroke: "#999"})),
      Plot.rect(data, Plot.binX({y1: "p25", y2: "p75"}, {...bin, fill: "#bbb"})),
      Plot.ruleY(data, Plot.binX({y: "p50"}, {...bin, strokeWidth: 2}))
    ]
  });
}
