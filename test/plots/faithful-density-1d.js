import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const faithful = await d3.tsv("data/faithful.tsv", d3.autoType);
  return Plot.plot({
    height: 100,
    inset: 20,
    marks: [
      Plot.density(faithful, {x: "waiting", stroke: "steelblue", strokeWidth: 0.25, bandwidth: 10}),
      Plot.density(faithful, {x: "waiting", stroke: "steelblue", thresholds: 4, bandwidth: 10}),
      Plot.dot(faithful, {x: "waiting", fill: "currentColor", r: 1.5})
    ]
  });
}
