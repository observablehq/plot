import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function metroUnemploymentHighlight() {
  const bls = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  const highlight = (d) => /, MI /.test(d.division);
  return Plot.plot({
    y: {
      grid: true,
      label: "Unemployment (%)"
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
