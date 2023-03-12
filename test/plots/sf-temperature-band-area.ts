import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function sfTemperatureBandArea() {
  const temperatures = await d3.csv<any>("data/sf-temperatures.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Daily temperature range (°F)"
    },
    marks: [
      Plot.areaY(
        temperatures,
        Plot.windowY({k: 7, strict: true, x: "date", y1: "low", y2: "high", curve: "step", fill: "#ccc"})
      ),
      Plot.line(
        temperatures,
        Plot.windowY({k: 7, strict: true, x: "date", y: (d) => (d.low + d.high) / 2, curve: "step"})
      )
    ],
    width: 960
  });
}
