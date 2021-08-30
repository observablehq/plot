import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const barley = await d3.csv("data/barley.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 110,
    height: 800,
    grid: true,
    x: {
      nice: true
    },
    y: {
      inset: 5
    },
    color: {
      type: "categorical"
    },
    facet: {
      data: barley,
      y: "site",
      marginRight: 90
    },
    marks: [
      Plot.frame(),
      Plot.dot(barley, {
        x: "yield",
        y: "variety",
        stroke: "year",
        sort: {
          fy: "x",
          y: "x",
          reduce: "median",
          reverse: true
        }
      })
    ]
  });
}
