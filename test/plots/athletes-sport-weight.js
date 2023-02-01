import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 100,
    grid: true,
    color: {scheme: "YlGnBu", zero: true},
    marks: [
      Plot.barX(athletes, Plot.binX({fill: "proportion-facet"}, {x: "weight", fy: "sport", thresholds: 60})),
      Plot.frame({anchor: "bottom", facetAnchor: "bottom"})
    ]
  });
}
