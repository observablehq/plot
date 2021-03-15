import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const temperatures = await d3.csv("data/sf-temperatures.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Daily temperature range (°F)"
    },
    marks: [
      Plot.areaY(temperatures, Plot.movingAverageY({k: 7, x: "date", y1: "low", y2: "high", curve: "step", fill: "#ccc"})),
      Plot.line(temperatures, Plot.movingAverageY({k: 7, x: "date", y: d => (d.low + d.high) / 2, curve: "step"}))
    ],
    width: 960
  });
}
