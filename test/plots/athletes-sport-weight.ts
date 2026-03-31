import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function athletesSportWeight() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
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
