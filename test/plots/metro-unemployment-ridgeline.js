import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 1080,
    x: {
      label: null
    },
    y: {
      range: [20, -40],
      axis: null
    },
    fy: {
      domain: d3.groupSort(data, g => -d3.max(g, d => d.unemployment), d => d.division),
      label: null
    },
    facet: {
      data,
      y: "division",
      marginLeft: 300
    },
    marks: [
      Plot.areaY(data, {x: "date", y: "unemployment", fill: "#eee"}),
      Plot.line(data, {x: "date", y: "unemployment"}),
      Plot.ruleY([0])
    ]
  });
}
