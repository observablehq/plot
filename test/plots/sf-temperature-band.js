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
      Plot.areaY(temperatures, {x: "date", y1: "low", y2: "high", curve: "step", fill: "#ccc"}),
      Plot.line(temperatures, Plot.windowY({x: "date", y: "low", k: 7, strict: true, curve: "step", stroke: "blue"})),
      Plot.line(temperatures, Plot.windowY({x: "date", y: "high", k: 7, strict: true, curve: "step", stroke: "red"}))
    ],
    width: 960
  });
}
