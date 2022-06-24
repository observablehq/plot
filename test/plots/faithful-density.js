import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const faithful = await d3.tsv("data/faithful.tsv", d3.autoType);
  return Plot.plot({
    inset: 20,
    marks: [
      Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", strokeWidth: 0.25}),
      Plot.density(faithful, {x: "waiting", y: "eruptions", thresholds: 4, stroke: "steelblue"}),
      Plot.dot(faithful, {x: "waiting", y: "eruptions", fill: "currentColor", r: 1.5})
    ]
  });
}
