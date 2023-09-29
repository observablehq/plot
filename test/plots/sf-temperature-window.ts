import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function sfTemperatureWindow() {
  const sftemp = await d3.csv<any>("data/sf-temperatures.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "Temperature (°F)"
    },
    marks: [
      Plot.lineY(sftemp, {x: "date", y: "low", strokeOpacity: 0.3}),
      Plot.lineY(sftemp, Plot.windowY({k: 28, reduce: "min"}, {x: "date", y: "low", stroke: "blue"})),
      Plot.lineY(sftemp, Plot.windowY({k: 28, reduce: "max"}, {x: "date", y: "low", stroke: "red"})),
      Plot.lineY(sftemp, Plot.windowY({k: 28, reduce: "median"}, {x: "date", y: "low"}))
    ]
  });
}
