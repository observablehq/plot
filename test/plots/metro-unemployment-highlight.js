import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const bls = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  const highlight = d => /, MI /.test(d.division);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Unemployment (%)"
    },
    color: {
      domain: [false, true],
      range: ["#ccc", "red"]
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(bls, {
        x: "date",
        y: "unemployment",
        z: "division",
        sort: highlight,
        stroke: highlight
      })
    ]
  });
}
