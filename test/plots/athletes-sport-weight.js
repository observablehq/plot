import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {
      grid: true
    },
    color: {
      scheme: "YlGnBu",
      zero: true
    },
    facet: {
      data: athletes,
      marginLeft: 100,
      y: "sport"
    },
    marks: [
      Plot.barX(athletes, Plot.binX({fill: "proportion-facet"}, {x: "weight", thresholds: 60}))
    ]
  });
}
