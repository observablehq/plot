import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 1080,
    y: {
      range: [20, -40],
      axis: null
    },
    fy: {
      round: true,
      label: null
    },
    facet: {
      data,
      y: "division",
      marginLeft: 300
    },
    marks: [
      Plot.areaY(data, {x: "date", y: "unemployment", fill: "#eee"}),
      Plot.line(data, {x: "date", y: "unemployment", sort: {fy: "y", reverse: true}}),
      Plot.ruleY([0])
    ]
  });
}
