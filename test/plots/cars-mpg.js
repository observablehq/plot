import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/cars.csv", d3.autoType);

  return Plot.plot({
    x: {inset: 20, ticks: 10},
    y: {grid: true},
    color: {
      type: "categorical",
      legend: true // as soon as it's available
    },
    marks: [
      Plot.ruleY([0], {filter: false}),
      Plot.line(data,
        Plot.binX({y: "mean"}, {
          x: "year",
          y: "economy (mpg)",
          stroke: "cylinders",
          curve: "basis",
          thresholds: 20
        })
      ),
      Plot.dot(data,
        Plot.reverse(Plot.sort("length", Plot.binY({r: "count"}, {
          x: "year",
          y: "economy (mpg)",
          fill: "cylinders",
          thresholds: 20
        }))
      ))
    ]
  });
}
