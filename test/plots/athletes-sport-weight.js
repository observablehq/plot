import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 640,
    marginLeft: 100,
    x: {
      grid: true
    },
    color: {
      scheme: "YlGnBu",
      zero: true
    },
    marks: [
      Plot.barX(athletes, Plot.binX({fill: "proportion-group"}, {x: "weight", y: "sport", thresholds: 60}))
    ]
  });
}
