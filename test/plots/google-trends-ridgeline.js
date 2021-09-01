import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/google-trends-2020.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    x: {
      axis: "top",
      label: null
    },
    y: {
      range: [12, -24],
      axis: null
    },
    fy: {
      label: null
    },
    facet: {
      data,
      y: "search",
      marginLeft: 160
    },
    marks: [
      Plot.areaY(data, {x: "week", y: "interest", fillOpacity: 0.3, sort: {fy: "y", reduce: "max-index"}}),
      Plot.line(data, {x: "week", y: "interest", stroke: "white", strokeWidth: 1}),
      Plot.ruleY([0])
    ]
  });
}
