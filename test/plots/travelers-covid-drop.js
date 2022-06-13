import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const travelers = await d3.csv("data/travelers.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      zero: true,
      label: "↓ Drop in passenger throughput (2020 vs. 2019)",
      tickFormat: "%"
    },
    marks: [
      Plot.line(travelers, {x: "date", y: d => d.current / d.previous - 1, strokeWidth: 0.25, curve: "step"}),
      Plot.line(travelers, Plot.windowY({x: "date", y: d => d.current / d.previous - 1, k: 7, stroke: "steelblue"}))
    ],
    width: 960
  });
}
