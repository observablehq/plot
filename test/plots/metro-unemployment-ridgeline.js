import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 1080,
    marginLeft: 300,
    x: {
      label: null
    },
    y: {
      range: [20, -40]
    },
    fy: {
      domain: d3.rollups(data, group => d3.max(group, d => d.unemployment), d => d.division)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .map(([key]) => key),
      label: null
    },
    facet: {
      data,
      y: "division"
    },
    marks: [
      Plot.areaY(data, {x: "date", y: "unemployment", fill: "#eee"}),
      Plot.line(data, {x: "date", y: "unemployment"}),
      Plot.ruleY([0])
    ]
  });
}
