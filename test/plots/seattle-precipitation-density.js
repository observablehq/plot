import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/seattle-weather.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.density(data, {x: "temp_min", y: "wind", weight: "precipitation"}),
      Plot.dot(data, {x: "temp_min", y: "wind", r: "precipitation", fill: "steelblue", fillOpacity: 0.5})
    ]
  });
}
