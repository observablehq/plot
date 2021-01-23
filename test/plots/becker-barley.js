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
      domain: d3.rollups(barley, group => d3.median(group, d => d.yield), d => d.variety)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .map(([key]) => key),
      inset: 5
    },
    fy: {
      domain: d3.rollups(barley, group => d3.median(group, d => d.yield), d => d.site)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .map(([key]) => key)
    },
    color: {
      type: "ordinal"
    },
    facet: {
      data: barley,
      y: "site",
      marginRight: 90
    },
    marks: [
      Plot.frame(),
      Plot.dot(barley, {x: "yield", y: "variety", stroke: "year"})
    ]
  });
}
