import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const cars = await d3.csv("data/cars.csv", d3.autoType);
  return Plot.plot({
    color: {
      scheme: "reds",
      nice: true,
      legend: true
    },
    marks: [
      Plot.hexagon(
        cars,
        Plot.hexbin(
          { r: "count", fill: "mean" },
          { x: "displacement (cc)", y: "economy (mpg)", fill: "weight (lb)" }
        )
      )
    ]
  });
}
