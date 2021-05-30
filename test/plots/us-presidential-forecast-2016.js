import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-presidential-forecast-2016-histogram.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "Electoral votes for Hillary Clinton →",
      labelAnchor: "left",
      ticks: [100, 200, 300, 400, 500]
    },
    y: {
      ticks: 5,
      tickFormat: '%'
    },
    marks: [
      Plot.barY(data, {x: "dem_ev", y: "prob", shapeRendering: "crispEdges", fill: "dem_ev", stroke: "dem_ev" }),
      Plot.ruleY([0]),
      Plot.ruleX([270])
    ]
  });
}
