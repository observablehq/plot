import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/riaa-us-revenue.csv", d3.autoType);
  return Plot.plot({
    x: { tickFormat: d => d },
    y: { axis: null },
    marks: [
      Plot.stackAreaY(data, {
        x: "year",
        z: "format",
        y: "value",
        rank: "insideOut",
        offset: "wiggle",
        fill: "group",
        curve: "cardinal",
        stroke: "white",
        title: "format"
      })
    ]
  });
}
