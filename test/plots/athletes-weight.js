import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 100,
    height: 640,
    x: {
      grid: true
    },
    color: {
      scheme: "YlGnBu",
      zero: true
    },
    marks: [
      Plot.barX(athletes, Plot.binX({x: "weight", y: "sport", thresholds: 60, normalize: "z", out: "fill"}))
    ]
  });
}
