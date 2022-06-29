import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/seattle-weather.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Temperature (°F)",
      transform: (f) => (f * 9) / 5 + 32 // convert from Celsius
    },
    color: {
      type: "linear",
      scheme: "BuRd"
    },
    marks: [
      Plot.ruleX(data, {
        x: "date",
        y1: "temp_min",
        y2: "temp_max",
        stroke: "temp_min"
      })
    ]
  });
}
