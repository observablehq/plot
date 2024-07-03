import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function faithfulDensity() {
  const faithful = await d3.tsv<any>("data/faithful.tsv", d3.autoType);
  return Plot.plot({
    inset: 20,
    marks: [
      Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", strokeWidth: 0.25}),
      Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", thresholds: 4}),
      Plot.dot(faithful, {x: "waiting", y: "eruptions", fill: "currentColor", r: 1.5})
    ]
  });
}

export async function faithfulDensityFill() {
  const faithful = await d3.tsv<any>("data/faithful.tsv", d3.autoType);
  return Plot.plot({
    inset: 30,
    marks: [Plot.frame({fill: 0}), Plot.density(faithful, {x: "waiting", y: "eruptions", fill: "density"})]
  });
}
