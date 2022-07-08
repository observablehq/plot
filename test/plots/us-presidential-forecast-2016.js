import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/us-presidential-forecast-2016-histogram.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "Electoral votes for Hillary Clinton →"
    },
    y: {
      ticks: 5,
      percent: true
    },
    color: {
      type: "threshold",
      domain: [270]
    },
    marks: [
      Plot.ruleX(data, {
        x: "dem_electoral_votes",
        y: "probability",
        shapeRendering: "crispEdges",
        stroke: "dem_electoral_votes",
        strokeWidth: 1.5
      }),
      Plot.ruleY([0]),
      Plot.ruleX([270])
    ]
  });
}
