import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/cars.csv", d3.autoType);
  return Plot.plot({
    x: {
      type: "point"
    },
    y: {
      grid: true,
      zero: true
    },
    color: {
      type: "ordinal"
    },
    marks: [
      Plot.line(
        data,
        Plot.groupX(
          {y: "mean"},
          {
            x: "year",
            y: "economy (mpg)",
            stroke: "cylinders",
            curve: "basis"
          }
        )
      ),
      Plot.dot(
        data,
        Plot.binY(
          {r: "count"},
          {
            x: "year",
            y: "economy (mpg)",
            stroke: "cylinders",
            thresholds: 20
          }
        )
      )
    ]
  });
}
